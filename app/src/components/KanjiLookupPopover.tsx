import React, { useState } from 'react';
import { LookupResult } from '../utils/kanjiDictionary';
import { Volume2, Plus, Check, X } from 'lucide-react';
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
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const handlePlaySpeech = (e: React.MouseEvent) => {
    e.stopPropagation();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(result.rootForm || result.word || result.query);
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
        word: result.rootForm || result.word,
        reading: result.reading && result.reading !== '---' ? result.reading : (result.rootForm || result.word),
        meaningVi: result.meaningVi,
        jlptLevel: 'N4',
        partOfSpeech: result.sinoVietnamese ? `Hán Việt: ${result.sinoVietnamese}` : 'Từ vựng'
      });
      setIsSaved(true);
      if (onSavedToDeck) onSavedToDeck(result.rootForm || result.word);
    } catch (err) {
      console.warn('Could not save vocabulary:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // Ensure the popover doesn't overflow viewport width (max 340px)
  const popoverWidth = 320;
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
              {result.rootForm || result.word}
            </span>
            {result.reading && result.reading !== '---' && (
              <span style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--accent-pine)', fontFamily: 'var(--font-kanji)' }}>
                【{result.reading}】
              </span>
            )}
          </div>

          {result.conjugationNote && (
            <div style={{ fontSize: '0.74rem', color: '#D97706', fontWeight: 700, marginTop: '2px' }}>
              💡 Gốc từ: <strong>{result.rootForm}</strong> ({result.conjugationNote})
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

      <div style={{ height: '1.5px', background: '#E2E8F0', marginBottom: '12px' }} />

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
            {result.sinoVietnamese}
          </span>
        </div>

        {/* Kanji breakdown if multiple kanji */}
        {result.kanjiList.length > 0 && (
          <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '6px', padding: '6px 10px', marginTop: '6px' }}>
            {result.kanjiList.map((k, idx) => (
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
          {result.meaningVi}
        </div>
      </div>

      {/* Footer Action: Quick Add to Deck */}
      <div>
        <button
          type="button"
          onClick={handleSaveToDeck}
          disabled={isSaved || isSaving}
          style={{
            width: '100%',
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
      </div>
    </div>
  );
};
