import React, { useState, useEffect } from 'react';
import { api } from '../../../services/apiConfig';
import { Grammar } from '../../../types';
import { Plus, Trash2, Search, X, Copy, Check, FileSpreadsheet, Sparkles } from 'lucide-react';

const CSV_PROMPT_TEMPLATE = `Bạn là một chuyên gia ngôn ngữ tiếng Nhật. Hãy tạo giúp tôi danh sách các mẫu ngữ pháp tiếng Nhật trình độ [N5 / N4 / N3 / N2 / N1] dưới dạng bảng dữ liệu CSV (chuẩn UTF-8, dấu phân cách bằng dấu phẩy) để tôi import vào ứng dụng học tập NihongoAI.

Cấu trúc các cột bắt buộc:
Pattern,JLPT_Level,Meaning_Vi,Structure,Explanation

Mô tả ý nghĩa từng cột:
1. Pattern: Mẫu ngữ pháp tiếng Nhật (Ví dụ: ～たことがある)
2. JLPT_Level: Cấp độ JLPT (N5, N4, N3, N2, hoặc N1)
3. Meaning_Vi: Ý nghĩa tiếng Việt súc tích, dễ hiểu (Ví dụ: Đã từng làm gì đó (kinh nghiệm))
4. Structure: Công thức cấu trúc biến đổi (Ví dụ: V-た + ことがある)
5. Explanation: Giải thích chi tiết cách dùng và ngữ cảnh sử dụng

Dữ liệu mẫu tham khảo:
Pattern,JLPT_Level,Meaning_Vi,Structure,Explanation
"～たことがある","N4","Đã từng làm gì đó (kinh nghiệm)","V-た + ことがある","Dùng để diễn tả trải nghiệm hoặc kinh nghiệm từng làm việc gì trong quá khứ."
"～てはいけない","N5","Không được phép làm gì (cấm đoán)","V-て + はいけない","Mẫu câu cấm đoán mang tính quy định, luật lệ hoặc lời dặn của người lớn."
"～ほうがいい","N4","Nên / Không nên làm gì (khuyên bảo)","V-た / V-ない + ほうがいい","Dùng để đưa ra lời khuyên hoặc gợi ý hành động tốt hơn."

Yêu cầu định dạng xuất ra:
1. Tạo khoảng 20-30 mẫu ngữ pháp phổ biến, hữu ích nhất cho trình độ này.
2. Các ô có chứa dấu phẩy hoặc ngoặc kép phải được bọc trong cặp dấu ngoặc kép ("...").
3. Chỉ xuất ra một khối mã CSV duy nhất (\`\`\`csv ... \`\`\`), không giải thích lan man bên ngoài.`;

function parseGrammarCsv(csvText: string): Array<{
  pattern: string;
  jlptLevel: string;
  meaningVi: string;
  structure: string;
  explanation: string;
}> {
  const lines = csvText.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0 && !l.startsWith('```'));
  if (lines.length === 0) return [];

  let startIndex = 0;
  if (lines[0].toLowerCase().includes('pattern') || lines[0].toLowerCase().includes('mẫu')) {
    startIndex = 1;
  }

  const results: Array<{
    pattern: string;
    jlptLevel: string;
    meaningVi: string;
    structure: string;
    explanation: string;
  }> = [];

  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i];
    // Simple split respecting basic quotes
    const cells: string[] = [];
    let insideQuotes = false;
    let currentCell = '';

    for (let c = 0; c < line.length; c++) {
      const char = line[c];
      if (char === '"') {
        insideQuotes = !insideQuotes;
      } else if (char === ',' && !insideQuotes) {
        cells.push(currentCell.trim());
        currentCell = '';
      } else {
        currentCell += char;
      }
    }
    cells.push(currentCell.trim());

    const cleanCells = cells.map((cell) => {
      let val = cell.trim();
      if (val.startsWith('"') && val.endsWith('"')) {
        val = val.slice(1, -1).replace(/""/g, '"');
      }
      return val.trim();
    });

    if (cleanCells.length >= 2 && cleanCells[0]) {
      results.push({
        pattern: cleanCells[0],
        jlptLevel: cleanCells[1] && /N[1-5]/i.test(cleanCells[1]) ? cleanCells[1].toUpperCase() : 'N4',
        meaningVi: cleanCells[2] || cleanCells[1] || 'Ngữ pháp tiếng Nhật',
        structure: cleanCells[3] || '',
        explanation: cleanCells[4] || ''
      });
    }
  }

  return results;
}

export const GrammarPage: React.FC = () => {
  const [grammarList, setGrammarList] = useState<Grammar[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterLevel, setFilterLevel] = useState<string>('ALL');
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'single' | 'csv'>('single');

  // Copy state
  const [hasCopiedPrompt, setHasCopiedPrompt] = useState<boolean>(false);

  // Form State
  const [newPattern, setNewPattern] = useState<string>('');
  const [newMeaning, setNewMeaning] = useState<string>('');
  const [newStructure, setNewStructure] = useState<string>('');
  const [newExplanation, setNewExplanation] = useState<string>('');
  const [newLevel, setNewLevel] = useState<string>('N4');

  // CSV Import State
  const [csvContent, setCsvContent] = useState<string>('');
  const [isImporting, setIsImporting] = useState<boolean>(false);
  const [importMessage, setImportMessage] = useState<string | null>(null);

  useEffect(() => {
    loadGrammars();
  }, []);

  const loadGrammars = async () => {
    const data = await api.getGrammars();
    setGrammarList(data);
  };

  const handleCopyCsvPrompt = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(CSV_PROMPT_TEMPLATE);
    setHasCopiedPrompt(true);
    setTimeout(() => {
      setHasCopiedPrompt(false);
    }, 2500);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPattern || !newMeaning) return;

    await api.createGrammar({
      pattern: newPattern,
      meaningVi: newMeaning,
      structure: newStructure,
      explanation: newExplanation,
      jlptLevel: newLevel
    });

    setNewPattern('');
    setNewMeaning('');
    setNewStructure('');
    setNewExplanation('');
    setShowAddForm(false);
    loadGrammars();
  };

  const handleImportCsv = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvContent.trim()) return;

    setIsImporting(true);
    setImportMessage(null);
    try {
      const parsed = parseGrammarCsv(csvContent);
      if (parsed.length === 0) {
        setImportMessage('❌ Không tìm thấy dòng dữ liệu ngữ pháp hợp lệ trong CSV.');
        setIsImporting(false);
        return;
      }

      let count = 0;
      for (const item of parsed) {
        await api.createGrammar({
          pattern: item.pattern,
          meaningVi: item.meaningVi,
          structure: item.structure,
          explanation: item.explanation,
          jlptLevel: item.jlptLevel
        });
        count++;
      }

      setImportMessage(`✓ Đã thêm thành công ${count} mẫu ngữ pháp vào kho!`);
      setCsvContent('');
      await loadGrammars();
      setTimeout(() => {
        setShowAddForm(false);
        setImportMessage(null);
      }, 1500);
    } catch (err) {
      console.warn('Lỗi khi import CSV:', err);
      setImportMessage('❌ Có lỗi xảy ra khi nhập dữ liệu.');
    } finally {
      setIsImporting(false);
    }
  };

  const handleDelete = async (id?: number) => {
    if (!id) return;
    await api.deleteGrammar(id);
    loadGrammars();
  };

  const filteredGrammars = grammarList.filter((g) => {
    const matchesQuery =
      g.pattern.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.meaningVi.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (g.structure && g.structure.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesLevel = filterLevel === 'ALL' || g.jlptLevel === filterLevel;
    return matchesQuery && matchesLevel;
  });

  return (
    <div style={{ width: '100%', maxWidth: '960px', margin: '0 auto' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-grotesk)', fontSize: '1.6rem', fontWeight: 700, marginBottom: '4px' }}>
            📜 Quản lý Kho Ngữ pháp
          </h2>
          <p style={{ color: 'var(--ink-secondary)', fontSize: '0.9rem' }}>
            Mẫu câu và cấu trúc ngữ pháp có cấu trúc làm điều kiện sinh bài tập dịch câu Việt → Nhật.
          </p>
        </div>

        <button className="btn-tactile primary" onClick={() => { setShowAddForm(true); setActiveTab('single'); }}>
          <Plus size={16} /> Thêm Ngữ pháp
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div 
        style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          gap: '12px', 
          marginBottom: '18px',
          flexWrap: 'wrap'
        }}
      >
        {/* Search input */}
        <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--ink-muted)' }} />
          <input
            type="text"
            className="form-input-text"
            style={{ paddingLeft: '38px' }}
            placeholder="Tìm theo mẫu câu, cấu trúc hoặc ý nghĩa..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* JLPT Level Chips */}
        <div style={{ display: 'flex', gap: '6px' }}>
          {['ALL', 'N5', 'N4', 'N3'].map((lvl) => (
            <button
              key={lvl}
              onClick={() => setFilterLevel(lvl)}
              className={`btn-tactile sm ${filterLevel === lvl ? 'primary' : ''}`}
            >
              {lvl === 'ALL' ? 'Tất cả' : lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Grammar Table */}
      <div className="table-container" style={{ marginBottom: '24px' }}>
        <table className="tactile-table">
          <thead>
            <tr>
              <th style={{ width: '22%' }}>Mẫu câu</th>
              <th style={{ width: '26%' }}>Ý nghĩa Tiếng Việt</th>
              <th style={{ width: '32%' }}>Cấu trúc biến đổi</th>
              <th style={{ width: '10%' }}>JLPT</th>
              <th style={{ textAlign: 'center', width: '10%' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredGrammars.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '36px', color: 'var(--ink-muted)' }}>
                  Không tìm thấy mẫu ngữ pháp nào phù hợp.
                </td>
              </tr>
            ) : (
              filteredGrammars.map((g) => (
                <tr key={g.id}>
                  <td>
                    <span className="japanese-kanji" style={{ fontSize: '1.15rem', color: 'var(--accent-pine)' }}>
                      {g.pattern}
                    </span>
                  </td>
                  <td style={{ fontWeight: 600 }}>{g.meaningVi}</td>
                  <td>
                    <code style={{ background: '#FFE8D6', color: '#0F172A', padding: '2px 8px', borderRadius: '4px', border: '1px solid #0F172A', fontSize: '0.82rem', fontWeight: 700 }}>
                      {g.structure || 'V-plain'}
                    </code>
                  </td>
                  <td>
                    <span className="tag-jlpt">{g.jlptLevel}</span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <button
                      type="button"
                      className="btn-tactile sm icon-only"
                      onClick={() => handleDelete(g.id)}
                      title="Xóa mẫu này"
                      style={{ color: 'var(--accent-vermilion)' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Import Modal */}
      {showAddForm && (
        <div className="modal-backdrop" onClick={() => setShowAddForm(false)}>
          <div className="modal-box" style={{ maxWidth: '580px' }} onClick={(e) => e.stopPropagation()}>
            {/* Modal Header with Copy Button */}
            <div className="modal-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <h3 className="modal-heading" style={{ margin: 0 }}>
                  {activeTab === 'single' ? 'Thêm Mẫu Ngữ Pháp Mới' : 'Nhập Ngữ Pháp từ CSV'}
                </h3>
                {/* Nút Sao chép Prompt CSV */}
                <button
                  type="button"
                  onClick={handleCopyCsvPrompt}
                  title="Sao chép Prompt yêu cầu AI (ChatGPT/Gemini) tạo file CSV ngữ pháp đúng cấu trúc này"
                  className="btn-tactile sm"
                  style={{
                    background: hasCopiedPrompt ? '#D8F3DC' : '#FEF08A',
                    color: hasCopiedPrompt ? '#133E2B' : '#713F12',
                    border: '1.5px solid #0F172A',
                    borderRadius: '6px',
                    padding: '3px 8px',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    cursor: 'pointer'
                  }}
                >
                  {hasCopiedPrompt ? <Check size={13} color="#133E2B" /> : <Copy size={13} />}
                  <span>{hasCopiedPrompt ? 'Đã chép prompt!' : 'Copy prompt CSV'}</span>
                </button>
              </div>

              <button type="button" className="btn-tactile sm" onClick={() => setShowAddForm(false)}>
                <X size={16} />
              </button>
            </div>

            {/* Mode Switcher Tabs */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '14px', borderBottom: '1.5px solid #E2E8F0', paddingBottom: '8px' }}>
              <button
                type="button"
                className={`btn-tactile sm ${activeTab === 'single' ? 'primary' : ''}`}
                onClick={() => setActiveTab('single')}
                style={{ fontSize: '0.78rem' }}
              >
                Nhập từng mẫu
              </button>
              <button
                type="button"
                className={`btn-tactile sm ${activeTab === 'csv' ? 'primary' : ''}`}
                onClick={() => setActiveTab('csv')}
                style={{ fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <FileSpreadsheet size={13} />
                <span>Nhập hàng loạt bằng CSV</span>
              </button>
            </div>

            {activeTab === 'single' ? (
              /* Single Entry Form */
              <form onSubmit={handleCreate}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                  <div>
                    <label className="form-label">Mẫu ngữ pháp (Pattern):</label>
                    <input
                      type="text"
                      className="form-input-text"
                      placeholder="Ví dụ: ～たことがある"
                      value={newPattern}
                      onChange={(e) => setNewPattern(e.target.value)}
                      required
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="form-label">Cấp độ JLPT:</label>
                    <select
                      className="form-select"
                      value={newLevel}
                      onChange={(e) => setNewLevel(e.target.value)}
                    >
                      <option value="N5">N5</option>
                      <option value="N4">N4</option>
                      <option value="N3">N3</option>
                      <option value="N2">N2</option>
                      <option value="N1">N1</option>
                    </select>
                  </div>
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <label className="form-label">Ý nghĩa Tiếng Việt:</label>
                  <input
                    type="text"
                    className="form-input-text"
                    placeholder="Ví dụ: Đã từng làm gì đó (kinh nghiệm)"
                    value={newMeaning}
                    onChange={(e) => setNewMeaning(e.target.value)}
                    required
                  />
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <label className="form-label">Cấu trúc công thức biến đổi (Structure):</label>
                  <input
                    type="text"
                    className="form-input-text"
                    placeholder="Ví dụ: V-た + ことがある"
                    value={newStructure}
                    onChange={(e) => setNewStructure(e.target.value)}
                  />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label className="form-label">Giải thích chi tiết (tùy chọn):</label>
                  <textarea
                    className="form-textarea"
                    rows={3}
                    placeholder="Dùng để diễn tả trải nghiệm trong quá khứ..."
                    value={newExplanation}
                    onChange={(e) => setNewExplanation(e.target.value)}
                  />
                </div>

                <div className="modal-foot">
                  <button type="button" className="btn-tactile" onClick={() => setShowAddForm(false)}>Hủy</button>
                  <button type="submit" className="btn-tactile primary">Lưu Ngữ Pháp</button>
                </div>
              </form>
            ) : (
              /* Bulk CSV Import Form */
              <form onSubmit={handleImportCsv}>
                <div style={{
                  background: '#F0F9FF',
                  border: '1.5px solid #BAE6FD',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  marginBottom: '14px',
                  fontSize: '0.8rem',
                  color: '#0369A1',
                  lineHeight: 1.5
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, marginBottom: '4px' }}>
                    <Sparkles size={14} color="#0284C7" />
                    <span>Hướng dẫn nhập nhanh bằng AI:</span>
                  </div>
                  1. Nhấn nút <strong>Copy prompt CSV</strong> ở trên.<br />
                  2. Dán vào ChatGPT hoặc Gemini để tạo danh sách ngữ pháp.<br />
                  3. Sao chép kết quả bảng CSV và dán vào ô bên dưới, sau đó bấm <strong>Nhập vào CSDL</strong>.
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <label className="form-label">Dán nội dung CSV vào đây (hoặc tải file):</label>
                  <textarea
                    className="form-textarea"
                    rows={6}
                    style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}
                    placeholder={'Pattern,JLPT_Level,Meaning_Vi,Structure,Explanation\n"～たことがある","N4","Đã từng làm gì đó","V-た + ことがある","Diễn tả kinh nghiệm..."\n"～てはいけない","N5","Không được làm gì","V-て + はいけない","Cấm đoán..."'}
                    value={csvContent}
                    onChange={(e) => setCsvContent(e.target.value)}
                    required
                  />
                </div>

                {importMessage && (
                  <div style={{
                    marginBottom: '14px',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    background: importMessage.startsWith('✓') ? '#D8F3DC' : '#FEE2E2',
                    color: importMessage.startsWith('✓') ? '#133E2B' : '#991B1B',
                    border: '1.5px solid #0F172A'
                  }}>
                    {importMessage}
                  </div>
                )}

                <div className="modal-foot">
                  <button type="button" className="btn-tactile" onClick={() => setShowAddForm(false)}>Đóng</button>
                  <button type="submit" disabled={isImporting || !csvContent.trim()} className="btn-tactile primary">
                    {isImporting ? 'Đang nhập...' : 'Nhập vào CSDL'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
