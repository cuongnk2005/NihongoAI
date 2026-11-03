import React, { useState, useEffect, useRef } from 'react';
import { Flashcard } from '../../../types';
import { RotateCcw, CheckCircle, ArrowLeft, Volume2, Check, X as XIcon, Eye, EyeOff } from 'lucide-react';
import { getButtonIntervals, applyAnkiRating, resolveCardState, RatingType } from '../../../utils/ankiScheduler';

interface QueueSnapshot {
  cards: Flashcard[];
  currentIndex: number;
}

const defaultCards: Flashcard[] = [
  {
    id: 1,
    word: '食べる',
    reading: 'たべる',
    meaningVi: 'ăn (dùng bữa, dùng cơm)',
    sinoVietnamese: 'THỰC',
    partOfSpeech: 'Động từ nhóm 2',
    jlptLevel: 'N5',
    exampleSentenceJa: '毎朝、パンと卵を食べます。',
    exampleSentenceVi: 'Mỗi sáng tôi đều ăn bánh mì và trứng.',
    intervalDays: 0,
    reps: 0
  },
  {
    id: 2,
    word: '見る',
    reading: 'みる',
    meaningVi: 'nhìn, xem, ngắm',
    sinoVietnamese: 'KIẾN',
    partOfSpeech: 'Động từ nhóm 2',
    jlptLevel: 'N5',
    exampleSentenceJa: '昨日、友達と映画を見ました。',
    exampleSentenceVi: 'Hôm qua tôi đã xem phim với bạn bè.',
    intervalDays: 0,
    reps: 0
  },
  {
    id: 3,
    word: '～たことがある',
    reading: '～たことがある',
    meaningVi: 'đã từng làm gì đó (biểu thị kinh nghiệm)',
    partOfSpeech: 'Mẫu ngữ pháp',
    jlptLevel: 'N4',
    exampleSentenceJa: '日本へ行ったことがありますか。',
    exampleSentenceVi: 'Bạn đã từng đi Nhật Bản bao giờ chưa?',
    intervalDays: 0,
    reps: 0
  },
  {
    id: 4,
    word: '約束',
    reading: 'やくそく',
    meaningVi: 'lời hứa, cuộc hẹn',
    sinoVietnamese: 'ƯỚC THÚC',
    partOfSpeech: 'Danh từ',
    jlptLevel: 'N4',
    exampleSentenceJa: '友達と約束があります。',
    exampleSentenceVi: 'Tôi có một cuộc hẹn với bạn bè.',
    intervalDays: 3,
    reps: 4
  },
  {
    id: 5,
    word: '美しい',
    reading: 'うつくしい',
    meaningVi: 'đẹp đẽ, tuyệt mỹ, thanh khiết',
    sinoVietnamese: 'MỸ',
    partOfSpeech: 'Tính từ đuôi い',
    jlptLevel: 'N3',
    exampleSentenceJa: '富士山の夕焼けは本当に美しいです。',
    exampleSentenceVi: 'Hoàng hôn trên núi Phú Sĩ thực sự rất đẹp.',
    intervalDays: 7,
    reps: 8
  }
];

interface ReviewPageProps {
  deckTitle?: string;
  customCards?: Flashcard[];
  onBackToDecks?: () => void;
}

const renderClozeFront = (text: string, hint?: string): string => {
  return text.replace(/\{\{c\d+::(.*?)\}\}/g, () => {
    return `[${hint || '...'}]`;
  });
};

const renderClozeBack = (text: string): React.ReactNode => {
  const parts: React.ReactNode[] = [];
  const regex = /\{\{c\d+::(.*?)\}\}/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }
    parts.push(
      <span
        key={match.index}
        style={{
          backgroundColor: '#FEF08A',
          color: '#713F12',
          padding: '2px 8px',
          borderRadius: '4px',
          fontWeight: 700,
          border: '1.5px solid #713F12',
          margin: '0 4px'
        }}
      >
        {match[1]}
      </span>
    );
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }
  return parts;
};

/**
 * Helper to normalize reading/word for answer comparison
 * (strips extra romaji notes like "たべる • taberu" -> "たべる")
 */
const extractCleanHiragana = (rawReading?: string): string => {
  if (!rawReading) return '';
  return rawReading.split('•')[0].split('(')[0].trim().toLowerCase();
};

export const ReviewPage: React.FC<ReviewPageProps> = ({ deckTitle, customCards, onBackToDecks }) => {
  const [cards, setCards] = useState<Flashcard[]>(() => {
    return customCards && customCards.length > 0 ? customCards : defaultCards;
  });

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [showAnswer, setShowAnswer] = useState<boolean>(false);
  const [completed, setCompleted] = useState<boolean>(false);
  const [history, setHistory] = useState<QueueSnapshot[]>([]);
  const [typedAnswer, setTypedAnswer] = useState<string>('');
  const typingInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (customCards && customCards.length > 0) {
      // Place New & Learning cards first so new vocabulary is learned right away, or preserve order
      setCards(customCards);
      setCurrentIndex(0);
      setShowAnswer(false);
      setCompleted(false);
      setHistory([]);
      setTypedAnswer('');
    }
  }, [customCards]);

  const currentCard = cards[currentIndex] || cards[0];
  const currentCardState = resolveCardState(currentCard);
  const buttonIntervals = getButtonIntervals(currentCard);

  // Auto-focus typing input when showing front of a typing_2way card
  useEffect(() => {
    if (!showAnswer && currentCard?.cardType === 'typing_2way') {
      setTimeout(() => {
        typingInputRef.current?.focus();
      }, 40);
    }
  }, [currentIndex, showAnswer, currentCard?.cardType]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (completed) return;

      const activeTag = (document.activeElement?.tagName || '').toLowerCase();
      const isTypingInInput = activeTag === 'input' || activeTag === 'textarea';

      if (isTypingInInput) {
        if (e.code === 'Enter') {
          e.preventDefault();
          (document.activeElement as HTMLElement)?.blur();
          if (!showAnswer) {
            setShowAnswer(true);
          } else {
            handleRating('good');
          }
        }
        return;
      }

      if (e.code === 'Enter' || e.code === 'Space') {
        e.preventDefault();
        if (!showAnswer) {
          setShowAnswer(true);
        } else {
          handleRating('good');
        }
      } else if (showAnswer) {
        if (e.key === '1') handleRating('again');
        if (e.key === '2') handleRating('hard');
        if (e.key === '3') handleRating('good');
        if (e.key === '4') handleRating('easy');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showAnswer, currentIndex, completed, cards]);

  const handleRating = (rating: RatingType) => {
    // Save snapshot for Undo
    setHistory((prev) => [...prev, { cards: [...cards], currentIndex }]);
    setShowAnswer(false);
    setTypedAnswer('');

    const outcome = applyAnkiRating(currentCard, rating);
    const nextCards = [...cards];
    nextCards[currentIndex] = outcome.updatedCard;

    if (!outcome.graduatedForToday) {
      // Minute-based learning step (1 phút, 6 phút, 10 phút):
      // Re-insert the updated card ahead in the current session queue so learner sees it again!
      const insertPos = Math.min(nextCards.length, currentIndex + 1 + outcome.requeueOffset);
      nextCards.splice(insertPos, 0, { ...outcome.updatedCard });
    }

    setCards(nextCards);

    if (currentIndex + 1 < nextCards.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setCompleted(true);
    }
  };

  const handleRestart = () => {
    setCards(customCards && customCards.length > 0 ? customCards : defaultCards);
    setCurrentIndex(0);
    setShowAnswer(false);
    setCompleted(false);
    setHistory([]);
    setTypedAnswer('');
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const prevSnapshot = history[history.length - 1];
    setHistory((prev) => prev.slice(0, -1));
    setCards(prevSnapshot.cards);
    setCurrentIndex(prevSnapshot.currentIndex);
    setShowAnswer(false);
    setCompleted(false);
    setTypedAnswer('');
  };

  const playSpeech = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ja-JP';
      window.speechSynthesis.speak(utterance);
    }
  };

  // Evaluate typed answer for typing_2way cards
  const checkTypingCorrect = (): boolean => {
    const cleanInput = typedAnswer.trim().toLowerCase();
    if (!cleanInput) return false;

    const cleanReading = extractCleanHiragana(currentCard.reading);
    const cleanWord = (currentCard.word || '').trim().toLowerCase();

    if (currentCard.typingDirection === 'kanji_to_reading') {
      return cleanInput === cleanReading || cleanInput === (currentCard.reading || '').trim().toLowerCase();
    } else {
      return cleanInput === cleanWord || cleanInput === cleanReading;
    }
  };

  if (completed) {
    return (
      <div style={{ maxWidth: '640px', margin: '40px auto', textAlign: 'center' }}>
        <div className="card-tactile" style={{ padding: '48px 36px' }}>
          <CheckCircle size={64} color="var(--accent-pine)" style={{ margin: '0 auto 16px auto' }} />
          <h2 style={{ fontFamily: 'var(--font-grotesk)', fontSize: '2rem', marginBottom: '8px' }}>
            Chúc mừng! Phiên ôn tập hoàn tất
          </h2>
          <p style={{ color: 'var(--ink-secondary)', marginBottom: '28px', fontSize: '1.05rem' }}>
            Bạn đã hoàn thành toàn bộ {cards.length} thẻ trong hàng đợi hôm nay. Thuật toán FSRS đã cập nhật lịch trình tối ưu tiếp theo.
          </p>
          <div style={{ display: 'flex', gap: '14px', justifyContent: 'center' }}>
            <button className="btn-tactile" onClick={handleRestart}>
              <RotateCcw size={16} />
              <span>Ôn tập lại</span>
            </button>
            {onBackToDecks && (
              <button className="btn-tactile primary" onClick={onBackToDecks}>
                <ArrowLeft size={16} />
                <span>Trở về Bộ thẻ</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const progressPercent = Math.round(((currentIndex + 1) / cards.length) * 100);
  const isTypingCorrect = currentCard.cardType === 'typing_2way' ? checkTypingCorrect() : false;

  return (
    <div style={{ width: '100%', maxWidth: '920px', margin: '0 auto' }}>
      {/* ===================================================================== */}
      {/* SINGLE UNIFIED TOP BAR: Deck Name + Progress Bar + Quick Controls     */}
      {/* ===================================================================== */}
      <div
        style={{
          background: 'var(--bg-surface)',
          border: 'var(--border-dark)',
          borderRadius: 'var(--radius-box)',
          boxShadow: 'var(--shadow-sm)',
          padding: '12px 18px',
          marginBottom: '18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          flexWrap: 'wrap'
        }}
      >
        {/* Left: Back Button + Deck Name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: '200px' }}>
          {onBackToDecks && (
            <button
              className="btn-tactile sm"
              onClick={onBackToDecks}
              style={{ padding: '5px 10px' }}
              title="Quay lại danh sách bộ thẻ"
            >
              <ArrowLeft size={14} />
            </button>
          )}
          <span
            className="deck-title"
            style={{
              fontSize: '1rem',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '280px'
            }}
            title={deckTitle || 'Minna no Nihongo (Bài 1 - 25)'}
          >
            {deckTitle || 'Minna no Nihongo (Bài 1 - 25)'}
          </span>
        </div>

        {/* Center: Progress Bar Track + Counter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '180px' }}>
          <div
            style={{
              flex: 1,
              height: '10px',
              background: 'var(--bg-stone)',
              border: '1.5px solid #0F172A',
              borderRadius: '999px',
              overflow: 'hidden'
            }}
          >
            <div
              style={{
                height: '100%',
                background: 'var(--accent-pine)',
                width: `${progressPercent}%`,
                transition: 'width 0.25s ease'
              }}
            />
          </div>
          <span
            style={{
              fontSize: '0.86rem',
              fontWeight: 700,
              fontFamily: 'var(--font-grotesk)',
              minWidth: '48px',
              textAlign: 'right',
              fontVariantNumeric: 'tabular-nums'
            }}
          >
            {currentIndex + 1} / {cards.length}
          </span>
        </div>

        {/* Right: Undo & Toggle Answer */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            className="btn-tactile sm"
            onClick={handleUndo}
            disabled={history.length === 0}
            style={{ opacity: history.length === 0 ? 0.45 : 1, padding: '5px 10px' }}
            title="Hoàn tác thẻ vừa học"
          >
            <RotateCcw size={13} />
            <span>Hoàn tác</span>
          </button>

          <button
            className="btn-tactile sm"
            onClick={() => setShowAnswer((prev) => !prev)}
            style={{ padding: '5px 10px' }}
          >
            {showAnswer ? <EyeOff size={13} /> : <Eye size={13} />}
            <span>{showAnswer ? 'Ẩn đáp án' : 'Hiện đáp án'}</span>
          </button>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* FLASHCARD STAGE: Balanced Spacing & Proportions                       */}
      {/* ===================================================================== */}
      <div className="card-stage" style={{ marginBottom: '18px' }}>
        <div
          className="flashcard-tactile"
          onClick={() => setShowAnswer((prev) => !prev)}
          style={{
            padding: '28px 36px',
            minHeight: '390px',
            gap: '20px'
          }}
        >
          {/* Card Top Meta Row */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              width: '100%',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '8px',
              paddingBottom: '12px',
              borderBottom: '1px solid #F1F5F9'
            }}
          >
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
              <span className="meta-pill">{currentCard.jlptLevel || 'N5'}</span>
              {/* Anki Learning State Pill */}
              {currentCardState === 'new' && (
                <span className="meta-pill" style={{ background: '#E2E8F0', color: '#0F172A', fontWeight: 700 }}>
                  🆕 Mới học (New)
                </span>
              )}
              {currentCardState === 'learning' && (currentCard.learningStep || 0) === 0 && (
                <span className="meta-pill" style={{ background: '#FEF08A', color: '#713F12', fontWeight: 700 }}>
                  ⏳ Đang học ({currentCard.lastIntervalLabel || '1 phút'})
                </span>
              )}
              {currentCardState === 'learning' && (currentCard.learningStep || 0) >= 1 && (
                <span className="meta-pill" style={{ background: '#FED7AA', color: '#9A3412', fontWeight: 700 }}>
                  🔄 Đã xem 1 lần (Bước 10 phút)
                </span>
              )}
              {currentCardState === 'relearning' && (
                <span className="meta-pill" style={{ background: '#FECACA', color: '#991B1B', fontWeight: 700 }}>
                  🔁 Học lại (10 phút)
                </span>
              )}
              {currentCardState === 'review' && (
                <span className="meta-pill" style={{ background: '#BBF7D0', color: '#14532D', fontWeight: 700 }}>
                  📅 Ôn tập ({currentCard.intervalDays || 1} ngày)
                </span>
              )}
              {currentCard.cardType === 'typing_2way' && (
                <span
                  className="meta-pill"
                  style={{
                    background: currentCard.typingDirection === 'kanji_to_reading' ? '#DCFCE7' : '#E0F2FE',
                    color: currentCard.typingDirection === 'kanji_to_reading' ? '#166534' : '#075985',
                    fontWeight: 700
                  }}
                >
                  {currentCard.typingDirection === 'kanji_to_reading'
                    ? '⌨️ Thẻ 1: Kanji → Gõ Hiragana'
                    : '⌨️ Thẻ 2: Nghĩa Việt → Gõ Tiếng Nhật'}
                </span>
              )}
              {currentCard.cardType === 'basic' && (
                <span className="meta-pill" style={{ background: '#E0E7FF', color: '#3730A3', fontWeight: 600 }}>
                  🎴 Cơ bản
                </span>
              )}
              {currentCard.cardType === 'reversed' && (
                <span className="meta-pill" style={{ background: '#FCE7F3', color: '#9D174D', fontWeight: 600 }}>
                  🔄 Hai chiều
                </span>
              )}
              {currentCard.cardType === 'cloze' && (
                <span className="meta-pill" style={{ background: '#FEF3C7', color: '#92400E', fontWeight: 600 }}>
                  🧩 Điền từ
                </span>
              )}
              {currentCard.deckName && (
                <span className="meta-pill" style={{ background: '#FFE8D6', color: '#0F172A', border: '1px solid #0F172A', fontWeight: 700 }}>
                  📁 {currentCard.deckName}
                </span>
              )}
            </div>

            <button
              className="btn-tactile sm"
              style={{ padding: '6px 10px' }}
              onClick={(e) => {
                e.stopPropagation();
                playSpeech(currentCard.word);
              }}
              title="Phát âm tiếng Nhật"
            >
              <Volume2 size={16} />
            </button>
          </div>

          {/* Card Center Body */}
          <div className="card-center-body" style={{ width: '100%', margin: 'auto 0', padding: '6px 0' }}>
            {/* ============================================================== */}
            {/* TYPE: TYPING_2WAY (2-Card Typing Mode: Kanji->Hiragana & Vi->Ja) */}
            {/* ============================================================== */}
            {currentCard.cardType === 'typing_2way' && (
              <div style={{ width: '100%', maxWidth: '680px', margin: '0 auto' }}>
                {/* FRONT STATE: Centered Prompt + Hero + Symmetrical Centered Input */}
                {!showAnswer ? (
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      textAlign: 'center',
                      padding: '12px 0'
                    }}
                  >
                    <div
                      style={{
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        color: 'var(--ink-secondary)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        marginBottom: '12px'
                      }}
                    >
                      {currentCard.typingDirection === 'kanji_to_reading'
                        ? 'Từ Kanji • Hãy nhập cách đọc Hiragana'
                        : 'Ý nghĩa tiếng Việt • Hãy nhập từ tiếng Nhật tương ứng'}
                    </div>

                    {currentCard.typingDirection === 'kanji_to_reading' ? (
                      <h1 className="kanji-hero" style={{ fontSize: '4.5rem', margin: '0 0 22px' }}>
                        {currentCard.word}
                      </h1>
                    ) : (
                      <h2
                        style={{
                          fontSize: '2.4rem',
                          fontWeight: 800,
                          color: 'var(--accent-pine)',
                          margin: '0 0 22px',
                          lineHeight: 1.3
                        }}
                      >
                        {currentCard.meaningVi}
                      </h2>
                    )}

                    {/* Dead-Center Symmetrical Input Box & Button */}
                    <div
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '12px',
                        width: '100%',
                        maxWidth: '380px',
                        margin: '0 auto'
                      }}
                    >
                      <input
                        ref={typingInputRef}
                        type="text"
                        value={typedAnswer}
                        onChange={(e) => setTypedAnswer(e.target.value)}
                        placeholder={
                          currentCard.typingDirection === 'kanji_to_reading'
                            ? 'Gõ cách đọc Hiragana vào đây...'
                            : 'Gõ từ tiếng Nhật vào đây...'
                        }
                        style={{
                          width: '100%',
                          padding: '11px 16px',
                          fontSize: '1rem',
                          fontWeight: 600,
                          borderRadius: '8px',
                          border: '2px solid #0F172A',
                          background: 'var(--bg-surface)',
                          color: 'var(--ink-primary)',
                          outline: 'none',
                          boxShadow: 'none',
                          textAlign: 'center',
                          boxSizing: 'border-box'
                        }}
                      />
                      <button
                        type="button"
                        className="btn-tactile primary"
                        onClick={() => setShowAnswer(true)}
                        style={{ padding: '8px 28px', minWidth: '140px' }}
                      >
                        Kiểm tra đáp án
                      </button>
                    </div>
                  </div>
                ) : (
                  /* BACK STATE: Balanced Full-Width Card Details */
                  <div
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      background: '#F8FAFC',
                      border: '1.5px solid #CBD5E1',
                      borderRadius: '12px',
                      padding: '18px 22px',
                      textAlign: 'left'
                    }}
                  >
                    {/* Typing Check Result Banner */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '8px',
                        padding: '10px 14px',
                        marginBottom: '16px',
                        borderRadius: '8px',
                        background: isTypingCorrect ? '#DCFCE7' : '#FEE2E2',
                        border: `1px solid ${isTypingCorrect ? '#86EFAC' : '#FCA5A5'}`,
                        color: isTypingCorrect ? '#166534' : '#991B1B',
                        fontSize: '0.9rem',
                        fontWeight: 700
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {isTypingCorrect ? <Check size={17} /> : <XIcon size={17} />}
                        <span>
                          {isTypingCorrect
                            ? `Chính xác! (${typedAnswer.trim()})`
                            : typedAnswer.trim()
                            ? `Bạn nhập: "${typedAnswer}"`
                            : 'Bạn chưa nhập câu trả lời'}
                        </span>
                      </div>
                      <span>
                        Đáp án chuẩn:{' '}
                        <strong>
                          {currentCard.typingDirection === 'kanji_to_reading'
                            ? currentCard.reading
                            : `${currentCard.word} (${currentCard.reading})`}
                        </strong>
                      </span>
                    </div>

                    {/* 4 Core Fields in a Balanced 2x2 Grid */}
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '12px',
                        marginBottom: '12px'
                      }}
                    >
                      <div
                        style={{
                          background: 'var(--bg-surface)',
                          border: '1px solid #E2E8F0',
                          borderRadius: '8px',
                          padding: '10px 14px'
                        }}
                      >
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--ink-secondary)', textTransform: 'uppercase', display: 'block', marginBottom: '2px' }}>
                          Từ Kanji
                        </span>
                        <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--ink-primary)' }}>
                          {currentCard.word}
                        </span>
                      </div>

                      <div
                        style={{
                          background: 'var(--bg-surface)',
                          border: '1px solid #E2E8F0',
                          borderRadius: '8px',
                          padding: '10px 14px'
                        }}
                      >
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--ink-secondary)', textTransform: 'uppercase', display: 'block', marginBottom: '2px' }}>
                          Cách đọc Hiragana
                        </span>
                        <span style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--accent-vermilion)' }}>
                          {currentCard.reading || '—'}
                        </span>
                      </div>

                      <div
                        style={{
                          background: 'var(--bg-surface)',
                          border: '1px solid #E2E8F0',
                          borderRadius: '8px',
                          padding: '10px 14px'
                        }}
                      >
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--ink-secondary)', textTransform: 'uppercase', display: 'block', marginBottom: '2px' }}>
                          Ý nghĩa của từ
                        </span>
                        <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent-pine)' }}>
                          {currentCard.meaningVi}
                        </span>
                      </div>

                      <div
                        style={{
                          background: 'var(--bg-surface)',
                          border: '1px solid #E2E8F0',
                          borderRadius: '8px',
                          padding: '10px 14px'
                        }}
                      >
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--ink-secondary)', textTransform: 'uppercase', display: 'block', marginBottom: '2px' }}>
                          Nghĩa Hán Việt
                        </span>
                        <span style={{ fontSize: '1.05rem', fontWeight: 700, color: '#334155' }}>
                          {currentCard.sinoVietnamese || '—'}
                        </span>
                      </div>
                    </div>

                    {/* Example Sentence Box */}
                    <div
                      style={{
                        background: 'var(--bg-surface)',
                        border: '1px solid #E2E8F0',
                        borderRadius: '8px',
                        padding: '10px 14px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '12px'
                      }}
                    >
                      <div>
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--ink-secondary)', textTransform: 'uppercase', display: 'block', marginBottom: '2px' }}>
                          Ví dụ của từ
                        </span>
                        {currentCard.exampleSentenceJa ? (
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '0.98rem', color: 'var(--ink-primary)' }}>
                              {currentCard.exampleSentenceJa}
                            </div>
                            {currentCard.exampleSentenceVi && (
                              <div style={{ fontSize: '0.86rem', color: 'var(--ink-secondary)', marginTop: '2px' }}>
                                {currentCard.exampleSentenceVi}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span style={{ color: 'var(--ink-secondary)', fontSize: '0.85rem' }}>Chưa có câu ví dụ</span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => playSpeech(currentCard.exampleSentenceJa || currentCard.word)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          padding: '6px 12px',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          borderRadius: '6px',
                          border: '1px solid #CBD5E1',
                          background: '#F8FAFC',
                          cursor: 'pointer',
                          color: 'var(--ink-primary)',
                          whiteSpace: 'nowrap'
                        }}
                        title="Nghe phát âm"
                      >
                        <Volume2 size={14} color="var(--accent-pine)" /> Nghe
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Type 1: Basic */}
            {currentCard.cardType === 'basic' && (
              <>
                <div style={{ fontSize: '0.85rem', color: 'var(--ink-secondary)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px' }}>
                  Mặt trước (Câu hỏi)
                </div>
                <h2 style={{ fontSize: '1.65rem', fontWeight: 700, color: 'var(--ink-primary)', textAlign: 'center', marginBottom: '16px', lineHeight: 1.4 }}>
                  {currentCard.frontContent || currentCard.word}
                </h2>
                <div style={{ visibility: showAnswer ? 'visible' : 'hidden', marginTop: '16px', padding: '16px 20px', background: 'var(--bg-stone)', border: 'var(--border-dark)', borderRadius: 'var(--radius-btn)' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--ink-secondary)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '6px' }}>
                    Mặt sau (Đáp án)
                  </div>
                  <p style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--accent-pine)', margin: 0, lineHeight: 1.4 }}>
                    {currentCard.backContent || currentCard.meaningVi}
                  </p>
                </div>
              </>
            )}

            {/* Type 2: Reversed */}
            {currentCard.cardType === 'reversed' && (
              <>
                <div style={{ fontSize: '0.85rem', color: 'var(--ink-secondary)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px' }}>
                  {showAnswer ? 'Mặt sau (Tiếng Nhật)' : 'Mặt trước (Gợi ý)'}
                </div>
                <h2 style={{ fontSize: '1.65rem', fontWeight: 700, color: 'var(--ink-primary)', textAlign: 'center', marginBottom: '16px', lineHeight: 1.4 }}>
                  {currentCard.frontContent || currentCard.meaningVi}
                </h2>
                <div style={{ visibility: showAnswer ? 'visible' : 'hidden', marginTop: '16px', padding: '16px 20px', background: 'var(--bg-stone)', border: 'var(--border-dark)', borderRadius: 'var(--radius-btn)' }}>
                  <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent-vermilion)', margin: 0 }}>
                    {currentCard.backContent || currentCard.word}
                  </p>
                </div>
              </>
            )}

            {/* Type 3: Cloze Deletion */}
            {currentCard.cardType === 'cloze' && (
              <>
                <div style={{ fontSize: '0.85rem', color: 'var(--ink-secondary)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px' }}>
                  Điền vào chỗ trống
                </div>
                <p style={{ fontSize: '1.45rem', fontWeight: 700, lineHeight: 1.6, textAlign: 'center', color: 'var(--ink-primary)', marginBottom: '16px' }}>
                  {!showAnswer ? renderClozeFront(currentCard.frontContent || currentCard.word, currentCard.clozeHint) : renderClozeBack(currentCard.frontContent || currentCard.word)}
                </p>
                {(currentCard.backContent || currentCard.meaningVi) && (
                  <div style={{ visibility: showAnswer ? 'visible' : 'hidden', marginTop: '16px', padding: '14px 18px', background: 'var(--bg-stone)', border: 'var(--border-dark)', borderRadius: 'var(--radius-btn)' }}>
                    <p style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--ink-secondary)', margin: 0 }}>
                      💡 {currentCard.backContent || currentCard.meaningVi}
                    </p>
                  </div>
                )}
              </>
            )}

            {/* Type 4: Vocab (Default) */}
            {(!currentCard.cardType || currentCard.cardType === 'vocab') && (
              <>
                <h1 className="kanji-hero">{currentCard.word}</h1>

                <div className="reading-ruby-box" style={{ visibility: showAnswer ? 'visible' : 'hidden' }}>
                  {currentCard.reading}
                  {currentCard.sinoVietnamese ? ` • [${currentCard.sinoVietnamese}]` : ''}
                </div>

                <div className="meaning-vi-box" style={{ visibility: showAnswer ? 'visible' : 'hidden' }}>
                  {currentCard.meaningVi}
                </div>

                {currentCard.exampleSentenceJa && (
                  <div
                    className="example-box"
                    style={{
                      visibility: showAnswer ? 'visible' : 'hidden',
                      opacity: showAnswer ? 1 : 0
                    }}
                  >
                    <p className="example-ja">{currentCard.exampleSentenceJa}</p>
                    {currentCard.exampleSentenceVi && (
                      <p className="example-vi">{currentCard.exampleSentenceVi}</p>
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Flip Cue Prompt at Bottom of Card */}
          <div className="flip-cue" style={{ paddingTop: '8px', borderTop: '1px solid #F1F5F9', width: '100%', justifyContent: 'center' }}>
            <span>
              {showAnswer
                ? 'Nhấn Enter để chọn Good (mặc định) hoặc bấm phím số'
                : currentCard.cardType === 'typing_2way'
                ? 'Gõ câu trả lời rồi nhấn'
                : 'Nhấp vào thẻ hoặc nhấn'}
            </span>
            <span className="kbd-badge">{showAnswer ? 'Enter • 1 • 2 • 3 • 4' : 'Enter'}</span>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* FSRS 4 RATING CONTROLS (Bottom)                                       */}
      {/* ===================================================================== */}
      <div
        className="rating-deck"
        style={{
          opacity: showAnswer ? 1 : 0.45,
          pointerEvents: showAnswer ? 'auto' : 'none',
          transition: 'opacity 0.15s ease',
          marginBottom: 0
        }}
      >
        <button
          className="rating-btn again"
          onClick={() => handleRating('again')}
        >
          <span className="rating-keycap">1</span>
          <span className="rating-title" style={{ color: 'var(--accent-vermilion)' }}>Again</span>
          <span className="rating-interval">{buttonIntervals.again}</span>
        </button>

        <button
          className="rating-btn hard"
          onClick={() => handleRating('hard')}
        >
          <span className="rating-keycap">2</span>
          <span className="rating-title" style={{ color: 'var(--accent-amber)' }}>Hard</span>
          <span className="rating-interval">{buttonIntervals.hard}</span>
        </button>

        <button
          className="rating-btn good"
          onClick={() => handleRating('good')}
        >
          <span className="rating-keycap">3</span>
          <span className="rating-title" style={{ color: 'var(--accent-pine)' }}>Good</span>
          <span className="rating-interval">{buttonIntervals.good}</span>
        </button>

        <button
          className="rating-btn easy"
          onClick={() => handleRating('easy')}
        >
          <span className="rating-keycap">4</span>
          <span className="rating-title" style={{ color: 'var(--accent-cobalt)' }}>Easy</span>
          <span className="rating-interval">{buttonIntervals.easy}</span>
        </button>
      </div>
    </div>
  );
};
