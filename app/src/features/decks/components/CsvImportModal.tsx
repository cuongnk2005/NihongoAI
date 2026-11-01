import React, { useState, useRef, useMemo } from 'react';
import { Upload, FileText, X, CheckCircle2, AlertCircle, Download, Copy, Check, Sparkles } from 'lucide-react';
import { Flashcard, CardType } from '../../../types';
import { parseAnkiCsv, CsvDelimiter } from '../../../utils/csvParser';

export interface DeckOption {
  id: string;
  name: string;
  level: number;
}

export type DuplicatePolicy = 'skip' | 'update' | 'allow';

export interface CsvImportResult {
  targetDeckId: string;
  cardsToInsert: Flashcard[];
  cardsToUpdate: Flashcard[];
  importedCount: number;
  updatedCount: number;
  skippedCount: number;
}

interface CsvImportModalProps {
  initialDeckId: string;
  deckOptions: DeckOption[];
  existingCardsByDeck: Record<string, Flashcard[]>;
  onClose: () => void;
  onConfirmImport: (result: CsvImportResult) => void;
}

const SAMPLE_CSV_VOCAB = `Kanji,Hiragana,Ý nghĩa,Nghĩa Hán Việt,Ví dụ,Dịch ví dụ
電車,でんしゃ,tàu điện,ĐIỆN XA,毎日電車で会社へ行きます。,Mỗi ngày tôi đi làm bằng tàu điện.
図書館,としょかん,thư viện,ĐỒ THƯ QUÁN,図書館で本を借りました。,Tôi đã mượn sách ở thư viện.
経験,けいけん,kinh nghiệm,KINH NGHIỆM,いい経験になりました。,Đó đã trở thành một kinh nghiệm quý báu.
準備,じゅんび,chuẩn bị,CHUẨN BỊ,旅行の準備をしています。,Tôi đang chuẩn bị cho chuyến du lịch.
約束,やくそく,lời hứa / cuộc hẹn,ƯỚC THÚC,友達と約束があります。,Tôi có một cuộc hẹn với bạn bè.`;

export function buildAiCsvPrompt(deckName: string, cardType: CardType): string {
  if (cardType === 'typing_2way' || cardType === 'vocab') {
    return `Hãy đóng vai giáo viên tiếng Nhật và tạo danh sách từ vựng tiếng Nhật cho bộ thẻ "${deckName}" theo đúng định dạng CSV bên dưới để tôi import vào phần mềm Flashcard.

YÊU CẦU CẤU TRÚC CSV (Đúng 6 cột, phân cách bằng dấu phẩy):
Dòng 1 (Tiêu đề cột bắt buộc):
Kanji,Hiragana,Ý nghĩa,Nghĩa Hán Việt,Ví dụ,Dịch ví dụ

Giải thích từng cột:
1. Kanji: Từ vựng tiếng Nhật viết bằng Kanji (hoặc Kana nếu từ không có Kanji).
2. Hiragana: Cách đọc viết hoàn toàn bằng chữ Hiragana (không ghi kèm romaji để hệ thống chấm điểm gõ phím chính xác).
3. Ý nghĩa: Nghĩa tiếng Việt ngắn gọn, sát nghĩa.
4. Nghĩa Hán Việt: Âm Hán Việt viết IN HOA (VD: ĐIỆN XA, ĐỒ THƯ QUÁN). Nếu không có âm Hán Việt thì để trống.
5. Ví dụ: 1 câu ví dụ tiếng Nhật tự nhiên có chứa từ vựng đó.
6. Dịch ví dụ: Câu dịch tiếng Việt tương ứng với câu ví dụ.

QUY TẮC QUAN TRỌNG:
- Nếu nội dung trong một ô có chứa dấu phẩy (,), bắt buộc đặt toàn bộ ô đó trong dấu ngoặc kép ("...").
- Xuất kết quả trong một khối code \`\`\`csv duy nhất để tôi sao chép trực tiếp.

VÍ DỤ MẪU CHUẨN:
\`\`\`csv
Kanji,Hiragana,Ý nghĩa,Nghĩa Hán Việt,Ví dụ,Dịch ví dụ
電車,でんしゃ,tàu điện,ĐIỆN XA,毎日電車で会社へ行きます。,Mỗi ngày tôi đi làm bằng tàu điện.
図書館,としょかん,thư viện,ĐỒ THƯ QUÁN,図書館で本を借りました。,Tôi đã mượn sách ở thư viện.
約束,やくそく,"lời hứa, cuộc hẹn",ƯỚC THÚC,友達と約束があります。,Tôi có một cuộc hẹn với bạn bè.
\`\`\`

Hãy tạo cho tôi 20 từ vựng phù hợp với chủ đề "${deckName}" theo đúng chuẩn CSV trên:`;
  }

  if (cardType === 'cloze') {
    return `Hãy tạo danh sách câu luyện điền từ tiếng Nhật (Cloze Deletion) cho bộ thẻ "${deckName}" theo định dạng CSV chuẩn bên dưới:

YÊU CẦU CẤU TRÚC CSV (3 cột, phân cách bằng dấu phẩy):
Dòng 1 (Tiêu đề):
Câu tiếng Nhật có chỗ trống,Gợi ý trong ngoặc,Dịch nghĩa cả câu

Giải thích:
- Cột 1: Câu tiếng Nhật trong đó từ cần học được bọc trong cú pháp {{c1::từ_cần_điền}}.
- Cột 2: Gợi ý ngắn gọn hiển thị trong chỗ trống (nghĩa tiếng Việt hoặc từ loại).
- Cột 3: Dịch nghĩa cả câu sang tiếng Việt.

VÍ DỤ MẪU CHUẨN:
\`\`\`csv
Câu tiếng Nhật có chỗ trống,Gợi ý trong ngoặc,Dịch nghĩa cả câu
私は毎日{{c1::日本語}}を勉強します。,tiếng Nhật,Tôi học tiếng Nhật mỗi ngày.
日本へ{{c1::行った}}ことがありますか。,đã đi (thể た),Bạn đã từng đi Nhật Bản bao giờ chưa?
\`\`\`

Hãy tạo 15 câu bài tập Cloze phù hợp với bộ thẻ "${deckName}":`;
  }

  if (cardType === 'reversed') {
    return `Hãy tạo danh sách thẻ học hai chiều (Tiếng Nhật ↔ Tiếng Việt) cho bộ thẻ "${deckName}" theo định dạng CSV chuẩn bên dưới:

YÊU CẦU CẤU TRÚC CSV (3 cột, phân cách bằng dấu phẩy):
Dòng 1 (Tiêu đề):
Tiếng Nhật,Ý nghĩa tiếng Việt,Cách đọc Hiragana

VÍ DỤ MẪU CHUẨN:
\`\`\`csv
Tiếng Nhật,Ý nghĩa tiếng Việt,Cách đọc Hiragana
約束,"lời hứa, cuộc hẹn",やくそく
準備,chuẩn bị,じゅんび
\`\`\`

Hãy tạo 20 mục phù hợp với bộ thẻ "${deckName}" trong khối code \`\`\`csv:`;
  }

  return `Hãy tạo danh sách thẻ học Flashcard Cơ bản (Mặt trước hỏi - Mặt sau trả lời) cho bộ thẻ "${deckName}" theo định dạng CSV chuẩn bên dưới:

YÊU CẦU CẤU TRÚC CSV (2 cột, phân cách bằng dấu phẩy):
Dòng 1 (Tiêu đề):
Mặt trước,Mặt sau

VÍ DỤ MẪU CHUẨN:
\`\`\`csv
Mặt trước,Mặt sau
お疲れ様でした,"Anh/chị đã vất vả rồi (lời chào kết thúc công việc)"
～たことがある,"Đã từng làm gì đó (diễn tả kinh nghiệm trong quá khứ)"
\`\`\`

Hãy tạo 20 thẻ phù hợp với bộ thẻ "${deckName}" trong khối code \`\`\`csv:`;
}

export const CsvImportModal: React.FC<CsvImportModalProps> = ({
  initialDeckId,
  deckOptions,
  existingCardsByDeck,
  onClose,
  onConfirmImport
}) => {
  const [targetDeckId, setTargetDeckId] = useState<string>(initialDeckId);
  const [cardType, setCardType] = useState<CardType>('typing_2way');
  const [delimiter, setDelimiter] = useState<CsvDelimiter>('auto');
  const [hasHeader, setHasHeader] = useState<boolean>(true);
  const [duplicatePolicy, setDuplicatePolicy] = useState<DuplicatePolicy>('skip');

  const [fileName, setFileName] = useState<string>('');
  const [rawCsvText, setRawCsvText] = useState<string>('');
  const [showPasteBox, setShowPasteBox] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedPrompt, setCopiedPrompt] = useState<boolean>(false);
  const [showPromptPreview, setShowPromptPreview] = useState<boolean>(false);

  // Column indices (-1 means unmapped)
  const [colPrimary, setColPrimary] = useState<number>(0); // Kanji / Word / Front / Cloze sentence
  const [colReading, setColReading] = useState<number>(1); // Hiragana / Cloze hint
  const [colMeaning, setColMeaning] = useState<number>(2); // Meaning / Back
  const [colSinoVi, setColSinoVi] = useState<number>(3); // Nghĩa Hán Việt
  const [colExJa, setColExJa] = useState<number>(4); // Ví dụ của từ
  const [colExVi, setColExVi] = useState<number>(5); // Dịch ví dụ

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCardTypeChange = (newType: CardType) => {
    setCardType(newType);
    if (newType === 'typing_2way' || newType === 'vocab') {
      setColPrimary(0);
      setColReading(1);
      setColMeaning(2);
      setColSinoVi(3);
      setColExJa(4);
      setColExVi(5);
    } else if (newType === 'basic') {
      setColPrimary(0);
      setColMeaning(1);
      setColReading(-1);
      setColSinoVi(-1);
    } else if (newType === 'reversed') {
      setColPrimary(0);
      setColMeaning(1);
      setColReading(2);
      setColSinoVi(-1);
    } else if (newType === 'cloze') {
      setColPrimary(0);
      setColReading(1);
      setColMeaning(2);
      setColSinoVi(-1);
    }
  };

  const handleFileUpload = (file: File) => {
    setErrorMsg(null);
    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg('Kích thước file vượt quá giới hạn 10MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = (e.target?.result as string) || '';
      setFileName(file.name);
      setRawCsvText(content);

      const parsed = parseAnkiCsv(content, delimiter);
      if (parsed.maxColumns === 2 && (cardType === 'vocab' || cardType === 'typing_2way')) {
        setColPrimary(0);
        setColReading(0);
        setColMeaning(1);
        setColSinoVi(-1);
        setColExJa(-1);
        setColExVi(-1);
      } else if (parsed.maxColumns >= 3 && (cardType === 'vocab' || cardType === 'typing_2way')) {
        setColPrimary(0);
        setColReading(1);
        setColMeaning(2);
        setColSinoVi(parsed.maxColumns > 3 ? 3 : -1);
        setColExJa(parsed.maxColumns > 4 ? 4 : -1);
        setColExVi(parsed.maxColumns > 5 ? 5 : -1);
      }
    };
    reader.onerror = () => {
      setErrorMsg('Không thể đọc file. Vui lòng kiểm tra định dạng UTF-8.');
    };
    reader.readAsText(file, 'UTF-8');
  };

  const selectedDeckName = useMemo(() => {
    const found = deckOptions.find((d) => d.id === targetDeckId);
    return found ? found.name : 'Tiếng Nhật';
  }, [deckOptions, targetDeckId]);

  const aiPromptText = useMemo(() => {
    return buildAiCsvPrompt(selectedDeckName, cardType);
  }, [selectedDeckName, cardType]);

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(aiPromptText);
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 2800);
    } catch {
      // Fallback copy via temporary textarea
      const textarea = document.createElement('textarea');
      textarea.value = aiPromptText;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 2800);
    }
  };

  const handleLoadSample = () => {
    setErrorMsg(null);
    setFileName('mau-tu-vung-2-chieu.csv');
    setRawCsvText(SAMPLE_CSV_VOCAB);
    setCardType('typing_2way');
    setHasHeader(true);
    setColPrimary(0);
    setColReading(1);
    setColMeaning(2);
    setColSinoVi(3);
    setColExJa(4);
    setColExVi(5);
  };

  const handleDownloadSampleFile = () => {
    const bom = '\uFEFF';
    const blob = new Blob([bom + SAMPLE_CSV_VOCAB], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'anki-nihongo-sample.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const parsedCsv = useMemo(() => {
    if (!rawCsvText.trim()) {
      return { rows: [] as string[][], detectedDelimiter: ',' as const, maxColumns: 0, skippedCommentLines: 0 };
    }
    return parseAnkiCsv(rawCsvText, delimiter);
  }, [rawCsvText, delimiter]);

  const headerRow = hasHeader && parsedCsv.rows.length > 0 ? parsedCsv.rows[0] : null;
  const dataRows = useMemo(() => {
    if (parsedCsv.rows.length === 0) return [];
    return hasHeader ? parsedCsv.rows.slice(1) : parsedCsv.rows;
  }, [parsedCsv.rows, hasHeader]);

  const columnOptions = useMemo(() => {
    const count = Math.max(parsedCsv.maxColumns, 6);
    return Array.from({ length: count }, (_, idx) => {
      const headerLabel = headerRow && headerRow[idx] ? ` (${headerRow[idx]})` : '';
      const sampleVal =
        !headerRow && parsedCsv.rows[0] && parsedCsv.rows[0][idx]
          ? ` — "${parsedCsv.rows[0][idx].slice(0, 18)}"`
          : '';
      return {
        index: idx,
        label: `Cột ${idx + 1}${headerLabel}${sampleVal}`
      };
    });
  }, [parsedCsv.maxColumns, parsedCsv.rows, headerRow]);

  // Process rows into preview & validation summary
  const analysis = useMemo(() => {
    const existingCards = existingCardsByDeck[targetDeckId] || [];
    const existingMap = new Map<string, Flashcard>();
    for (const c of existingCards) {
      existingMap.set((c.word || '').trim().toLowerCase(), c);
    }

    const cardsToInsert: Flashcard[] = [];
    const cardsToUpdate: Flashcard[] = [];
    const rowErrors: { rowNumber: number; reason: string }[] = [];
    let skippedCount = 0;
    const baseId = Date.now();

    dataRows.forEach((row, idx) => {
      const actualRowNumber = hasHeader ? idx + 2 : idx + 1;
      const getVal = (colIdx: number) => (colIdx >= 0 && colIdx < row.length ? row[colIdx].trim() : '');

      const primary = getVal(colPrimary);
      const reading = getVal(colReading);
      const meaning = getVal(colMeaning);
      const sinoVi = getVal(colSinoVi);
      const exJa = getVal(colExJa);
      const exVi = getVal(colExVi);

      if (!primary) {
        rowErrors.push({ rowNumber: actualRowNumber, reason: 'Thiếu nội dung cột chính (Kanji / Mặt trước)' });
        skippedCount++;
        return;
      }

      if (cardType !== 'cloze' && !meaning) {
        rowErrors.push({ rowNumber: actualRowNumber, reason: `Thiếu nghĩa tiếng Việt cho từ "${primary}"` });
        skippedCount++;
        return;
      }

      if (cardType === 'typing_2way' && !reading) {
        rowErrors.push({ rowNumber: actualRowNumber, reason: `Thiếu Hiragana cho từ "${primary}"` });
        skippedCount++;
        return;
      }

      const duplicateCard = existingMap.get(primary.toLowerCase());
      if (duplicateCard) {
        if (duplicatePolicy === 'skip') {
          skippedCount++;
          return;
        }
        if (duplicatePolicy === 'update') {
          cardsToUpdate.push({
            ...duplicateCard,
            word: primary,
            reading: reading || duplicateCard.reading,
            meaningVi: meaning || duplicateCard.meaningVi,
            sinoVietnamese: sinoVi || duplicateCard.sinoVietnamese,
            exampleSentenceJa: exJa || duplicateCard.exampleSentenceJa,
            exampleSentenceVi: exVi || duplicateCard.exampleSentenceVi
          });
          return;
        }
      }

      if (cardType === 'typing_2way') {
        // Card 1: Mặt trước Kanji + ô nhập Hiragana -> Mặt sau hiển thị tất cả các trường
        cardsToInsert.push({
          id: baseId + idx * 2,
          word: primary,
          reading: reading,
          meaningVi: meaning,
          sinoVietnamese: sinoVi || undefined,
          exampleSentenceJa: exJa || undefined,
          exampleSentenceVi: exVi || undefined,
          partOfSpeech: 'Từ vựng',
          jlptLevel: 'N4',
          cardType: 'typing_2way',
          typingDirection: 'kanji_to_reading',
          reps: 0
        });
        // Card 2: Mặt trước Nghĩa tiếng Việt + ô nhập từ tiếng Nhật -> Mặt sau hiển thị tất cả các trường
        cardsToInsert.push({
          id: baseId + idx * 2 + 1,
          word: primary,
          reading: reading,
          meaningVi: meaning,
          sinoVietnamese: sinoVi || undefined,
          exampleSentenceJa: exJa || undefined,
          exampleSentenceVi: exVi || undefined,
          partOfSpeech: 'Từ vựng',
          jlptLevel: 'N4',
          cardType: 'typing_2way',
          typingDirection: 'meaning_to_ja',
          reps: 0
        });
      } else if (cardType === 'vocab') {
        cardsToInsert.push({
          id: baseId + idx * 2,
          word: primary,
          reading: reading || primary,
          meaningVi: meaning,
          sinoVietnamese: sinoVi || undefined,
          partOfSpeech: 'Từ vựng',
          jlptLevel: 'N4',
          exampleSentenceJa: exJa || undefined,
          exampleSentenceVi: exVi || undefined,
          cardType: 'vocab',
          reps: 0
        });
      } else if (cardType === 'basic') {
        cardsToInsert.push({
          id: baseId + idx * 2,
          word: primary,
          meaningVi: meaning,
          frontContent: primary,
          backContent: meaning,
          cardType: 'basic',
          reps: 0
        });
      } else if (cardType === 'reversed') {
        // Thẻ thuận
        cardsToInsert.push({
          id: baseId + idx * 2,
          word: primary,
          reading: reading || undefined,
          meaningVi: meaning,
          frontContent: primary,
          backContent: reading ? `${meaning} • Cách đọc: ${reading}` : meaning,
          cardType: 'reversed',
          reps: 0
        });
        // Thẻ đảo
        cardsToInsert.push({
          id: baseId + idx * 2 + 1,
          word: meaning,
          reading: reading || undefined,
          meaningVi: primary,
          frontContent: `[Nghĩa tiếng Việt] ${meaning}`,
          backContent: reading ? `${primary} (${reading})` : primary,
          cardType: 'reversed',
          reps: 0
        });
      } else if (cardType === 'cloze') {
        const finalSentence = primary.includes('{{c') ? primary : `{{c1::${primary}}}`;
        cardsToInsert.push({
          id: baseId + idx * 2,
          word: finalSentence,
          meaningVi: meaning || 'Điền từ thích hợp vào chỗ trống',
          frontContent: finalSentence,
          backContent: meaning || undefined,
          clozeHint: reading || undefined,
          cardType: 'cloze',
          reps: 0
        });
      }
    });

    return {
      cardsToInsert,
      cardsToUpdate,
      rowErrors,
      skippedCount
    };
  }, [
    dataRows,
    hasHeader,
    colPrimary,
    colReading,
    colMeaning,
    colSinoVi,
    colExJa,
    colExVi,
    cardType,
    duplicatePolicy,
    existingCardsByDeck,
    targetDeckId
  ]);

  const handleSubmit = () => {
    if (analysis.cardsToInsert.length === 0 && analysis.cardsToUpdate.length === 0) {
      setErrorMsg('Không có dòng dữ liệu hợp lệ nào để nhập. Vui lòng kiểm tra lại cột ánh xạ hoặc file CSV.');
      return;
    }

    onConfirmImport({
      targetDeckId,
      cardsToInsert: analysis.cardsToInsert,
      cardsToUpdate: analysis.cardsToUpdate,
      importedCount: analysis.cardsToInsert.length,
      updatedCount: analysis.cardsToUpdate.length,
      skippedCount: analysis.skippedCount
    });
  };

  const selectStyle: React.CSSProperties = {
    width: '100%',
    padding: '8px 10px',
    fontSize: '0.88rem',
    background: 'var(--bg-surface)',
    border: '1.5px solid #CBD5E1',
    borderRadius: '8px',
    color: 'var(--ink-primary)',
    outline: 'none',
    cursor: 'pointer'
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-box"
        style={{
          maxWidth: '660px',
          width: '95%',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '24px'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            paddingBottom: '14px',
            marginBottom: '16px',
            borderBottom: '1px solid #E2E8F0'
          }}
        >
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, color: 'var(--ink-primary)' }}>
              Nhập thẻ nhanh từ file CSV / TSV (Anki Import)
            </h3>
            <p style={{ fontSize: '0.84rem', color: 'var(--ink-secondary)', margin: '4px 0 0' }}>
              Hỗ trợ tự động sinh 2 thẻ luyện gõ phím (Kanji → Hiragana & Nghĩa → Tiếng Nhật) cho mỗi từ.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: '1px solid #CBD5E1',
              borderRadius: '6px',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--ink-secondary)'
            }}
            title="Đóng"
          >
            <X size={16} />
          </button>
        </div>

        {/* Step 1: Target Deck & Card Type */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '5px', color: 'var(--ink-primary)' }}>
              Nhập vào bộ thẻ
            </label>
            <select
              value={targetDeckId}
              onChange={(e) => setTargetDeckId(e.target.value)}
              style={{ ...selectStyle, fontWeight: 600 }}
            >
              {deckOptions.map((d) => (
                <option key={d.id} value={d.id}>
                  {'\u00A0'.repeat(d.level * 3)}
                  {d.level > 0 ? '↳ ' : '📁 '}
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '5px', color: 'var(--ink-primary)' }}>
              Loại thẻ cần tạo
            </label>
            <select
              value={cardType}
              onChange={(e) => handleCardTypeChange(e.target.value as CardType)}
              style={{ ...selectStyle, fontWeight: 600 }}
            >
              <option value="typing_2way">Từ vựng Gõ phím 2 chiều (Tự tạo 2 thẻ: Kanji↔Nghĩa)</option>
              <option value="vocab">Từ vựng Lật thẻ truyền thống (1 thẻ/từ)</option>
              <option value="basic">Cơ bản (Mặt trước → Mặt sau)</option>
              <option value="reversed">Hai chiều Lật thẻ (Thuận & Đảo)</option>
              <option value="cloze">Điền vào chỗ trống (Cloze)</option>
            </select>
          </div>
        </div>

        {/* AI Prompt Helper Banner + Info Box */}
        <div
          style={{
            padding: '12px 14px',
            background: '#F0FDF4',
            border: '1px solid #BBF7D0',
            borderRadius: '8px',
            fontSize: '0.8rem',
            color: '#166534',
            marginBottom: '16px',
            lineHeight: 1.5
          }}
        >
          {cardType === 'typing_2way' ? (
            <div style={{ marginBottom: '10px' }}>
              <strong>Chế độ Từ vựng Gõ phím 2 chiều:</strong> Mỗi dòng từ vựng trong file CSV sẽ tự động tạo ra <strong>2 thẻ ôn tập</strong>:
              <br />• <strong>Thẻ 1:</strong> Mặt trước hiện <strong>Kanji</strong> + ô nhập kiểm tra <strong>Hiragana</strong> → Mặt sau hiện đầy đủ tất cả các trường.
              <br />• <strong>Thẻ 2:</strong> Mặt trước hiện <strong>Nghĩa tiếng Việt</strong> + ô nhập kiểm tra <strong>Từ tiếng Nhật</strong> → Mặt sau hiện đầy đủ tất cả các trường.
            </div>
          ) : (
            <div style={{ marginBottom: '10px' }}>
              <strong> Tạo dữ liệu tự động bằng AI:</strong> Sao chép câu lệnh (Prompt) chuẩn bên dưới và gửi cho ChatGPT, Gemini hoặc Claude để AI tự tạo file CSV đúng cấu trúc cho bộ thẻ <strong>"{selectedDeckName}"</strong>.
            </div>
          )}

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '8px',
              paddingTop: '8px',
              borderTop: '1px solid #BBF7D0'
            }}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontWeight: 600, color: '#15803D' }}>
              <Sparkles size={14} /> Muốn nhờ AI (ChatGPT, Gemini...) tạo danh sách từ cho bộ <strong>"{selectedDeckName}"</strong>?
            </span>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setShowPromptPreview((v) => !v)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#166534',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  padding: '2px 4px'
                }}
              >
                {showPromptPreview ? 'Ẩn câu lệnh' : 'Xem câu lệnh'}
              </button>

              <button
                type="button"
                onClick={handleCopyPrompt}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  borderRadius: '6px',
                  border: '1px solid #15803D',
                  background: copiedPrompt ? '#15803D' : '#FFFFFF',
                  color: copiedPrompt ? '#FFFFFF' : '#15803D',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                title="Sao chép Prompt mẫu để dán vào ChatGPT, Claude hoặc Gemini"
              >
                {copiedPrompt ? (
                  <>
                    <Check size={14} /> Đã sao chép Prompt!
                  </>
                ) : (
                  <>
                    <Copy size={14} /> Sao chép Prompt cho AI
                  </>
                )}
              </button>
            </div>
          </div>

          {showPromptPreview && (
            <div style={{ marginTop: '10px' }}>
              <textarea
                readOnly
                rows={6}
                value={aiPromptText}
                onClick={(e) => (e.target as HTMLTextAreaElement).select()}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  fontSize: '0.76rem',
                  fontFamily: 'var(--font-mono)',
                  background: '#FFFFFF',
                  border: '1px solid #86EFAC',
                  borderRadius: '6px',
                  color: '#0F172A',
                  resize: 'vertical'
                }}
              />
            </div>
          )}
        </div>

        {/* Step 2: Upload File Box or Paste CSV */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--ink-primary)' }}>
              Nguồn dữ liệu CSV / TSV
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={handleLoadSample}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--accent-pine)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  padding: 0
                }}
              >
                Dùng thử dữ liệu mẫu
              </button>
              <span style={{ color: '#CBD5E1' }}>•</span>
              <button
                type="button"
                onClick={handleDownloadSampleFile}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--ink-secondary)',
                  fontSize: '0.8rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '3px',
                  padding: 0
                }}
              >
                <Download size={12} /> Tải file .csv mẫu
              </button>
              <span style={{ color: '#CBD5E1' }}>•</span>
              <button
                type="button"
                onClick={() => setShowPasteBox((v) => !v)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--ink-secondary)',
                  fontSize: '0.8rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                {showPasteBox ? 'Ẩn ô dán văn bản' : 'Dán trực tiếp từ Excel'}
              </button>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.tsv,.txt"
            style={{ display: 'none' }}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFileUpload(f);
            }}
          />

          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = 'copy';
            }}
            onDrop={(e) => {
              e.preventDefault();
              const f = e.dataTransfer.files?.[0];
              if (f) handleFileUpload(f);
            }}
            style={{
              border: '1.5px dashed #94A3B8',
              borderRadius: '10px',
              padding: '16px',
              textAlign: 'center',
              background: fileName ? '#F0FDF4' : '#F8FAFC',
              cursor: 'pointer',
              transition: 'background 0.15s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
              {fileName ? (
                <>
                  <FileText size={20} color="var(--accent-pine)" />
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--accent-pine)' }}>
                      {fileName}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--ink-secondary)' }}>
                      Đã đọc {dataRows.length} từ ({analysis.cardsToInsert.length} thẻ sẽ tạo) • Nhấn để đổi file khác
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <Upload size={20} color="var(--ink-secondary)" />
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--ink-primary)' }}>
                      Chọn file .csv, .tsv, .txt hoặc kéo thả vào đây
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--ink-secondary)' }}>
                      Các cột chuẩn: Kanji, Hiragana, Ý nghĩa, Nghĩa Hán Việt, Ví dụ
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {showPasteBox && (
            <div style={{ marginTop: '10px' }}>
              <textarea
                rows={4}
                placeholder="Dán nội dung CSV hoặc các dòng copy từ Excel / Anki vào đây..."
                value={rawCsvText}
                onChange={(e) => {
                  setFileName('Dữ liệu dán trực tiếp');
                  setRawCsvText(e.target.value);
                }}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  fontSize: '0.85rem',
                  fontFamily: 'var(--font-mono)',
                  background: 'var(--bg-surface)',
                  border: '1.5px solid #CBD5E1',
                  borderRadius: '8px',
                  resize: 'vertical'
                }}
              />
            </div>
          )}
        </div>

        {/* Step 3: Parsing Options & Field Mapping */}
        {rawCsvText.trim().length > 0 && (
          <>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: '10px',
                padding: '12px',
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                marginBottom: '16px'
              }}
            >
              <div>
                <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 600, marginBottom: '4px', color: 'var(--ink-secondary)' }}>
                  Dấu phân cách cột
                </label>
                <select
                  value={delimiter}
                  onChange={(e) => setDelimiter(e.target.value as CsvDelimiter)}
                  style={{ ...selectStyle, padding: '6px 8px', fontSize: '0.83rem' }}
                >
                  <option value="auto">
                    Tự động ({parsedCsv.detectedDelimiter === '\t' ? 'Tab' : parsedCsv.detectedDelimiter === ';' ? 'Chấm phẩy ;' : 'Dấu phẩy ,'})
                  </option>
                  <option value=",">Dấu phẩy (,)</option>
                  <option value={'\t'}>Phím Tab (\t)</option>
                  <option value=";">Chấm phẩy (;)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 600, marginBottom: '4px', color: 'var(--ink-secondary)' }}>
                  Khi trùng từ vựng
                </label>
                <select
                  value={duplicatePolicy}
                  onChange={(e) => setDuplicatePolicy(e.target.value as DuplicatePolicy)}
                  style={{ ...selectStyle, padding: '6px 8px', fontSize: '0.83rem' }}
                >
                  <option value="skip">Bỏ qua thẻ trùng</option>
                  <option value="update">Cập nhật thẻ đã có</option>
                  <option value="allow">Cho phép thêm trùng</option>
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', paddingTop: '18px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', color: 'var(--ink-primary)' }}>
                  <input
                    type="checkbox"
                    checked={hasHeader}
                    onChange={(e) => setHasHeader(e.target.checked)}
                    style={{ width: '15px', height: '15px', accentColor: 'var(--accent-pine)' }}
                  />
                  Dòng 1 là tiêu đề
                </label>
              </div>
            </div>

            {/* Field Mapping Section */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--ink-primary)', marginBottom: '8px' }}>
                Ghép cột từ file CSV vào các trường của thẻ
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {/* Primary Field */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: '4px', color: 'var(--ink-primary)' }}>
                    {cardType === 'vocab' || cardType === 'typing_2way'
                      ? 'Kanji / Từ tiếng Nhật *'
                      : cardType === 'cloze'
                      ? 'Câu tiếng Nhật có chỗ trống *'
                      : 'Mặt trước (Câu hỏi / Từ) *'}
                  </label>
                  <select value={colPrimary} onChange={(e) => setColPrimary(Number(e.target.value))} style={selectStyle}>
                    <option value={-1}>-- Không dùng --</option>
                    {columnOptions.map((c) => (
                      <option key={c.index} value={c.index}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Reading / Hint Field */}
                {cardType !== 'basic' && (
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: '4px', color: 'var(--ink-primary)' }}>
                      {cardType === 'cloze'
                        ? 'Gợi ý trong ngoặc (Tùy chọn)'
                        : cardType === 'typing_2way'
                        ? 'Hiragana (Cách đọc) *'
                        : 'Hiragana (Cách đọc)'}
                    </label>
                    <select value={colReading} onChange={(e) => setColReading(Number(e.target.value))} style={selectStyle}>
                      <option value={-1}>-- Không dùng --</option>
                      {columnOptions.map((c) => (
                        <option key={c.index} value={c.index}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Meaning / Back Field */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: '4px', color: 'var(--ink-primary)' }}>
                    {cardType === 'vocab' || cardType === 'typing_2way'
                      ? 'Ý nghĩa của từ (Tiếng Việt) *'
                      : cardType === 'cloze'
                      ? 'Dịch nghĩa cả câu'
                      : 'Mặt sau (Câu trả lời / Nghĩa) *'}
                  </label>
                  <select value={colMeaning} onChange={(e) => setColMeaning(Number(e.target.value))} style={selectStyle}>
                    <option value={-1}>-- Không dùng --</option>
                    {columnOptions.map((c) => (
                      <option key={c.index} value={c.index}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Extra Vocab & Typing_2way Fields */}
                {(cardType === 'vocab' || cardType === 'typing_2way') && (
                  <>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: '4px', color: 'var(--ink-primary)' }}>
                        Nghĩa Hán Việt
                      </label>
                      <select value={colSinoVi} onChange={(e) => setColSinoVi(Number(e.target.value))} style={selectStyle}>
                        <option value={-1}>-- Không dùng --</option>
                        {columnOptions.map((c) => (
                          <option key={c.index} value={c.index}>
                            {c.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: '4px', color: 'var(--ink-primary)' }}>
                        Ví dụ của từ (Câu tiếng Nhật)
                      </label>
                      <select value={colExJa} onChange={(e) => setColExJa(Number(e.target.value))} style={selectStyle}>
                        <option value={-1}>-- Không dùng --</option>
                        {columnOptions.map((c) => (
                          <option key={c.index} value={c.index}>
                            {c.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: '4px', color: 'var(--ink-primary)' }}>
                        Dịch nghĩa ví dụ (Tùy chọn)
                      </label>
                      <select value={colExVi} onChange={(e) => setColExVi(Number(e.target.value))} style={selectStyle}>
                        <option value={-1}>-- Không dùng --</option>
                        {columnOptions.map((c) => (
                          <option key={c.index} value={c.index}>
                            {c.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: '4px', color: 'var(--ink-secondary)' }}>
                        Trường Audio (Để dành cho phiên bản sau)
                      </label>
                      <input
                        type="text"
                        disabled
                        value="Chức năng đính kèm file Audio từ CSV sẽ được bổ sung sau (Hiện hỗ trợ phát âm TTS tự động)"
                        style={{
                          width: '100%',
                          padding: '7px 10px',
                          fontSize: '0.8rem',
                          background: '#F1F5F9',
                          border: '1px dashed #CBD5E1',
                          borderRadius: '8px',
                          color: 'var(--ink-secondary)',
                          cursor: 'not-allowed'
                        }}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Step 4: Live Preview Table */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--ink-secondary)' }}>
                  Xem trước {Math.min(dataRows.length, 5)}/{dataRows.length} từ trong file
                </span>
                <div style={{ display: 'flex', gap: '10px', fontSize: '0.78rem', fontWeight: 600 }}>
                  <span style={{ color: 'var(--accent-pine)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <CheckCircle2 size={13} /> Sẽ tạo: {analysis.cardsToInsert.length} thẻ học
                  </span>
                  {analysis.cardsToUpdate.length > 0 && (
                    <span style={{ color: '#0284C7' }}>Cập nhật: {analysis.cardsToUpdate.length}</span>
                  )}
                  {analysis.skippedCount > 0 && (
                    <span style={{ color: 'var(--ink-secondary)' }}>Bỏ qua: {analysis.skippedCount}</span>
                  )}
                </div>
              </div>

              <div
                style={{
                  border: '1px solid #CBD5E1',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  background: 'var(--bg-surface)'
                }}
              >
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                  <thead>
                    <tr style={{ background: '#F1F5F9', borderBottom: '1px solid #CBD5E1', textAlign: 'left' }}>
                      <th style={{ padding: '7px 8px', width: '32px', color: 'var(--ink-secondary)' }}>#</th>
                      <th style={{ padding: '7px 8px' }}>Kanji / Mặt trước</th>
                      {cardType !== 'basic' && <th style={{ padding: '7px 8px' }}>Hiragana</th>}
                      {(cardType === 'typing_2way' || cardType === 'vocab') && <th style={{ padding: '7px 8px' }}>Hán Việt</th>}
                      <th style={{ padding: '7px 8px' }}>Ý nghĩa</th>
                      {(cardType === 'typing_2way' || cardType === 'vocab') && <th style={{ padding: '7px 8px' }}>Ví dụ</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {dataRows.slice(0, 5).map((row, idx) => {
                      const p = colPrimary >= 0 ? row[colPrimary] || '' : '';
                      const r = colReading >= 0 ? row[colReading] || '' : '';
                      const s = colSinoVi >= 0 ? row[colSinoVi] || '' : '';
                      const m = colMeaning >= 0 ? row[colMeaning] || '' : '';
                      const ex = colExJa >= 0 ? row[colExJa] || '' : '';
                      return (
                        <tr key={idx} style={{ borderBottom: idx < 4 ? '1px solid #E2E8F0' : 'none' }}>
                          <td style={{ padding: '7px 8px', color: 'var(--ink-secondary)' }}>{idx + 1}</td>
                          <td style={{ padding: '7px 8px', fontWeight: 700, color: 'var(--ink-primary)' }}>
                            {p || <span style={{ color: 'var(--accent-vermilion)' }}>(Trống)</span>}
                          </td>
                          {cardType !== 'basic' && (
                            <td style={{ padding: '7px 8px', color: 'var(--accent-vermilion)', fontWeight: 600 }}>{r || '—'}</td>
                          )}
                          {(cardType === 'typing_2way' || cardType === 'vocab') && (
                            <td style={{ padding: '7px 8px', color: '#64748B', fontWeight: 600, fontSize: '0.75rem' }}>{s || '—'}</td>
                          )}
                          <td style={{ padding: '7px 8px', color: 'var(--accent-pine)', fontWeight: 600 }}>
                            {m || <span style={{ color: 'var(--ink-secondary)' }}>—</span>}
                          </td>
                          {(cardType === 'typing_2way' || cardType === 'vocab') && (
                            <td style={{ padding: '7px 8px', color: 'var(--ink-secondary)', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {ex || '—'}
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {analysis.rowErrors.length > 0 && (
                <div
                  style={{
                    marginTop: '8px',
                    padding: '8px 12px',
                    background: '#FEF2F2',
                    border: '1px solid #FECACA',
                    borderRadius: '6px',
                    fontSize: '0.78rem',
                    color: '#B91C1C'
                  }}
                >
                  <strong>Lưu ý:</strong> Có {analysis.rowErrors.length} dòng bị bỏ qua do thiếu thông tin bắt buộc (Ví dụ dòng {analysis.rowErrors[0].rowNumber}: {analysis.rowErrors[0].reason}).
                </div>
              )}
            </div>
          </>
        )}

        {errorMsg && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 12px',
              background: '#FEF2F2',
              border: '1px solid #FECACA',
              borderRadius: '8px',
              color: '#B91C1C',
              fontSize: '0.84rem',
              marginBottom: '14px'
            }}
          >
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Footer Actions */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: '14px',
            borderTop: '1px solid #E2E8F0'
          }}
        >
          <button type="button" className="btn-tactile" onClick={onClose} style={{ padding: '8px 16px' }}>
            Hủy
          </button>
          <button
            type="button"
            className="btn-tactile primary"
            onClick={handleSubmit}
            disabled={!rawCsvText.trim() || (analysis.cardsToInsert.length === 0 && analysis.cardsToUpdate.length === 0)}
            style={{
              padding: '8px 20px',
              opacity:
                !rawCsvText.trim() || (analysis.cardsToInsert.length === 0 && analysis.cardsToUpdate.length === 0)
                  ? 0.5
                  : 1
            }}
          >
            <Upload size={15} /> Nhập {analysis.cardsToInsert.length + analysis.cardsToUpdate.length} thẻ vào bộ
          </button>
        </div>
      </div>
    </div>
  );
};
