import React, { useState, useEffect } from 'react';
import { LookupResult, setCachedKanji } from '../utils/kanjiDictionary';
import { Volume2, Plus, Check, X, Sparkles, Loader2 } from 'lucide-react';
import { api } from '../services/apiConfig';

export interface KanjiLookupPopoverProps {
  result: LookupResult;
  position: { top: number; left: number };
  onClose: () => void;
  onSavedToDeck?: (word: string) => void;
}

export const KanjiLookupPopover: React.FC<KanjiLookupPopoverProps> = ({
  result,
  position,
  onClose,
  onSavedToDeck
}) => {
  const [currentResult, setCurrentResult] = useState<LookupResult>(result);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [isAiSourced, setIsAiSourced] = useState<boolean>(false);

  // Trigger AI lookup function
  const triggerAiLookup = async (lookupWord: string) => {
    setIsAiLoading(true);
    try {
      const aiData = await api.lookupKanjiAi(lookupWord);
      if (aiData && aiData.sinoVietnamese && aiData.sinoVietnamese !== '---') {
        const newResult: LookupResult = {
          query: lookupWord,
          word: aiData.word || lookupWord,
          reading: aiData.reading || lookupWord,
          sinoVietnamese: aiData.sinoVietnamese,
          meaningVi: aiData.meaningVi || 'Từ vựng tiếng Nhật',
          kanjiList: (aiData.kanjiList || []).map((k) => ({
            char: k.charStr || k.char || '',
            sino: k.sino || '---',
            meaning: k.meaning || ''
          })),
          rootForm: currentResult.rootForm,
          conjugationNote: currentResult.conjugationNote
        };
        setCurrentResult(newResult);
        setIsAiSourced(true);
        // Persist to local browser storage for 0ms lookup next time
        setCachedKanji(lookupWord, newResult);
      }
    } catch (err) {
      console.warn('AI lookup error:', err);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Check if offline dictionary lacks info, then auto-query Gemini AI
  useEffect(() => {
    setCurrentResult(result);
    setIsAiSourced(false);

    const hasMissingSino =
      !result.sinoVietnamese ||
      result.sinoVietnamese === '---' ||
      result.kanjiList.some((k) => k.sino === '---');

    const targetWord = result.rootForm || result.word || result.query;
    if (hasMissingSino && targetWord) {
      triggerAiLookup(targetWord);
    }
  }, [result]);

  const handlePlaySpeech = (e: React.MouseEvent) => {
    e.stopPropagation();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(currentResult.rootForm || currentResult.word || currentResult.query);
      utterance.lang = 'ja-JP';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSaveToDeck = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSaved || isSaving) return;
    setIsSaving(true);
    try {
      await api.createVocabulary({
        word: currentResult.rootForm || currentResult.word,
        reading: currentResult.reading && currentResult.reading !== '---'
          ? currentResult.reading
          : (currentResult.rootForm || currentResult.word),
        meaningVi: currentResult.meaningVi,
        jlptLevel: 'N4',
        partOfSpeech: currentResult.sinoVietnamese ? `Hán Việt: ${currentResult.sinoVietnamese}` : 'Từ vựng'
      });
      setIsSaved(true);
      if (onSavedToDeck) onSavedToDeck(currentResult.rootForm || currentResult.word);
    } catch (err) {
      console.warn('Could not save vocabulary:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // Ensure the popover doesn't overflow viewport width (max 340px)
  const popoverWidth = 330;
  const leftPosition = Math.max(16, Math.min(window.innerWidth - popoverWidth - 20, position.left - popoverWidth / 2));

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        position: 'fixed',
        top: `${Math.max(10, position.top)}px`,
        left: `${leftPosition}px`,
        width: `${popoverWidth}px`,
        zIndex: 9999,
        background: '#FFFFFF',
        border: '2px solid #0F172A',
        borderRadius: '12px',
        boxShadow: '4px 6px 0px rgba(15, 23, 42, 0.9)',
        padding: '16px',
        fontFamily: 'var(--font-grotesk), sans-serif',
        animation: 'fadeIn 0.15s ease-out'
      }}
    >
      {/* Header: Word, Reading, Audio & Close */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', flexWrap: 'wrap' }}>
            <span
              style={{
                fontFamily: 'var(--font-kanji)',
                fontSize: '1.45rem',
                fontWeight: 800,
                color: '#0F172A',
                letterSpacing: '0.02em'
              }}
            >
              {currentResult.rootForm || currentResult.word}
            </span>
            {currentResult.reading && currentResult.reading !== '---' && (
              <span style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--accent-pine)', fontFamily: 'var(--font-kanji)' }}>
                【{currentResult.reading}】
              </span>
            )}
          </div>

          {currentResult.conjugationNote && (
            <div style={{ fontSize: '0.74rem', color: '#D97706', fontWeight: 700, marginTop: '2px' }}>
              💡 Gốc từ: <strong>{currentResult.rootForm}</strong> ({currentResult.conjugationNote})
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
          <button
            type="button"
            onClick={handlePlaySpeech}
            title="Nghe phát âm tiếng Nhật"
            style={{
              background: '#F1F5F9',
              border: '1.5px solid #0F172A',
              borderRadius: '6px',
              padding: '4px 6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <Volume2 size={15} color="#0F172A" />
          </button>
          <button
            type="button"
            onClick={onClose}
            title="Đóng"
            style={{
              background: 'transparent',
              border: 'none',
              padding: '4px',
              cursor: 'pointer',
              color: '#64748B'
            }}
          >
            <X size={17} />
          </button>
        </div>
      </div>

      <div style={{ height: '1.5px', background: '#E2E8F0', marginBottom: '10px' }} />

      {/* AI Lookup Banner / Status */}
      {isAiLoading ? (
        <div
          style={{
            background: '#F0F9FF',
            border: '1.5px solid #0284C7',
            borderRadius: '6px',
            padding: '6px 10px',
            marginBottom: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.76rem',
            color: '#0369A1',
            fontWeight: 700
          }}
        >
          <Loader2 size={14} className="animate-spin" />
          <span>Gemini AI đang phân tích Hán Việt & nghĩa...</span>
        </div>
      ) : isAiSourced ? (
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            background: '#ECFDF5',
            border: '1px solid #A7F3D0',
            borderRadius: '4px',
            padding: '2px 6px',
            fontSize: '0.7rem',
            color: '#065F46',
            fontWeight: 700,
            marginBottom: '8px'
          }}
        >
          <Sparkles size={11} color="#059669" />
          <span>Phân tích bởi Gemini AI & Đã lưu bộ nhớ</span>
        </div>
      ) : null}

      {/* Sino-Vietnamese (Hán Việt) Badge */}
      <div style={{ marginBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
          <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
            Hán Việt:
          </span>
          <span
            style={{
              background: '#FEF08A',
              color: '#713F12',
              border: '1.5px solid #0F172A',
              padding: '2px 8px',
              borderRadius: '6px',
              fontSize: '0.82rem',
              fontWeight: 800,
              letterSpacing: '0.04em'
            }}
          >
            {currentResult.sinoVietnamese}
          </span>
        </div>

        {/* Kanji breakdown */}
        {currentResult.kanjiList.length > 0 && (
          <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '6px', padding: '6px 10px', marginTop: '6px' }}>
            {currentResult.kanjiList.map((k, idx) => (
              <div key={idx} style={{ fontSize: '0.78rem', color: '#334155', lineHeight: 1.5 }}>
                • <strong style={{ color: '#0F172A', fontFamily: 'var(--font-kanji)' }}>{k.char}</strong>{' '}
                <span style={{ fontWeight: 700, color: '#B45309' }}>[{k.sino}]</span>: {k.meaning}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Vietnamese Meaning */}
      <div style={{ marginBottom: '14px' }}>
        <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', marginBottom: '3px' }}>
          Ý nghĩa Tiếng Việt:
        </div>
        <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--accent-pine)', lineHeight: 1.4 }}>
          {currentResult.meaningVi}
        </div>
      </div>

      {/* Footer Action: Quick Add to Deck */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <button
          type="button"
          onClick={handleSaveToDeck}
          disabled={isSaved || isSaving}
          style={{
            flex: 1,
            padding: '7px 12px',
            borderRadius: '6px',
            border: '1.5px solid #0F172A',
            background: isSaved ? '#D8F3DC' : '#0F172A',
            color: isSaved ? '#133E2B' : '#FFFFFF',
            fontSize: '0.82rem',
            fontWeight: 700,
            cursor: isSaved ? 'default' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            transition: 'all 0.15s ease'
          }}
        >
          {isSaved ? (
            <>
              <Check size={14} color="#133E2B" />
              <span>Đã lưu vào bộ thẻ!</span>
            </>
          ) : (
            <>
              <Plus size={14} />
              <span>{isSaving ? 'Đang lưu...' : '+ Lưu vào Bộ thẻ học'}</span>
            </>
          )}
        </button>

        {!isAiSourced && !isAiLoading && (
          <button
            type="button"
            onClick={() => triggerAiLookup(currentResult.rootForm || currentResult.word || currentResult.query)}
            title="Nhờ Gemini AI phân tích lại chi tiết"
            style={{
              padding: '7px 10px',
              borderRadius: '6px',
              border: '1.5px solid #0F172A',
              background: '#F1F5F9',
              color: '#0F172A',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Sparkles size={14} color="#D97706" />
          </button>
        )}
      </div>
    </div>
  );
};
