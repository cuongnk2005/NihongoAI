import { useState, useCallback, useEffect } from 'react';
import { lookupJapaneseWord, LookupResult } from '../utils/kanjiDictionary';

export interface UseTextLookupReturn {
  lookupResult: LookupResult | null;
  position: { top: number; left: number };
  closeLookup: () => void;
  handleMouseUp: (e?: React.MouseEvent) => void;
  handleInputSelect: (e: React.SyntheticEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export const useTextLookup = (): UseTextLookupReturn => {
  const [lookupResult, setLookupResult] = useState<LookupResult | null>(null);
  const [position, setPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

  const closeLookup = useCallback(() => {
    setLookupResult(null);
  }, []);

  const handleMouseUp = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) {
      return;
    }

    const rawText = selection.toString().trim();
    if (!rawText || rawText.length > 25) {
      return;
    }

    // Must contain at least one Japanese character (Kanji, Hiragana, or Katakana)
    if (!/[\u3040-\u30ff\u4e00-\u9faf]/.test(rawText)) {
      return;
    }

    const res = lookupJapaneseWord(rawText);
    if (!res) return;

    try {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();

      // Viewport-relative coordinates (fixed positioning)
      const popoverHeight = 250;
      let top = rect.bottom + 8;
      // If bottom overflows viewport, place above the selected text
      if (top + popoverHeight > window.innerHeight && rect.top > popoverHeight + 10) {
        top = Math.max(10, rect.top - popoverHeight - 8);
      }

      setPosition({
        top,
        left: rect.left + rect.width / 2
      });
      setLookupResult(res);
    } catch (e) {
      console.warn('Could not determine selection bounding rect:', e);
    }
  }, []);

  // Support text selection inside <input> and <textarea> elements
  const handleInputSelect = useCallback((e: React.SyntheticEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const target = e.currentTarget;
    const start = target.selectionStart;
    const end = target.selectionEnd;

    if (start !== null && end !== null && end > start) {
      const selectedText = target.value.substring(start, end).trim();
      if (selectedText && selectedText.length <= 25 && /[\u3040-\u30ff\u4e00-\u9faf]/.test(selectedText)) {
        const res = lookupJapaneseWord(selectedText);
        if (res) {
          const rect = target.getBoundingClientRect();
          // Approximate character position
          const charWidth = 14;
          const offsetLeft = Math.min(rect.width - 60, Math.max(20, start * charWidth + 20));

          const popoverHeight = 250;
          let top = rect.bottom + 8;
          if (top + popoverHeight > window.innerHeight && rect.top > popoverHeight + 10) {
            top = Math.max(10, rect.top - popoverHeight - 8);
          }

          setPosition({
            top,
            left: rect.left + offsetLeft
          });
          setLookupResult(res);
        }
      }
    }
  }, []);

  // Global escape and click-outside listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeLookup();
      }
    };

    const handleDocumentClick = () => {
      setTimeout(() => {
        const selection = window.getSelection();
        if (!selection || selection.isCollapsed) {
          closeLookup();
        }
      }, 150);
    };

    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('click', handleDocumentClick);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('click', handleDocumentClick);
    };
  }, [closeLookup]);

  return {
    lookupResult,
    position,
    closeLookup,
    handleMouseUp,
    handleInputSelect
  };
};
