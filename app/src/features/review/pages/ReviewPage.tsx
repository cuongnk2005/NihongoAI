import React, { useState, useEffect } from 'react';
import { Layers, Eye, RotateCcw, CheckCircle } from 'lucide-react';

interface Flashcard {
  id: number;
  word: string;
  reading: string;
  meaningVi: string;
  exampleSentenceJa?: string;
  exampleSentenceVi?: string;
}

const mockCards: Flashcard[] = [
  {
    id: 1,
    word: '映画',
    reading: 'えいが',
    meaningVi: 'Bộ phim / Phim ảnh',
    exampleSentenceJa: '昨日の夜、友達と映画を見ました。',
    exampleSentenceVi: 'Tối qua tôi đã xem phim với bạn.'
  },
  {
    id: 2,
    word: '食べる',
    reading: 'たべる',
    meaningVi: 'Ăn',
    exampleSentenceJa: '毎朝、パンを食べます。',
    exampleSentenceVi: 'Mỗi sáng tôi ăn bánh mì.'
  },
  {
    id: 3,
    word: '勉強',
    reading: 'べんきょう',
    meaningVi: 'Học tập / Học hành',
    exampleSentenceJa: '日本語を勉強しています。',
    exampleSentenceVi: 'Tôi đang học tiếng Nhật.'
  }
];

export const ReviewPage: React.FC = () => {
  const [cards] = useState<Flashcard[]>(mockCards);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [showAnswer, setShowAnswer] = useState<boolean>(false);
  const [completed, setCompleted] = useState<boolean>(false);

  const currentCard = cards[currentIndex];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (completed) return;
      if (e.code === 'Space') {
        e.preventDefault();
        setShowAnswer((prev) => !prev);
      } else if (showAnswer) {
        if (e.key === '1') handleRating('again');
        if (e.key === '2') handleRating('hard');
        if (e.key === '3') handleRating('good');
        if (e.key === '4') handleRating('easy');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showAnswer, currentIndex, completed]);

  const handleRating = (rating: 'again' | 'hard' | 'good' | 'easy') => {
    console.log(`Card ${currentCard?.id} rated: ${rating}`);
    setShowAnswer(false);

    if (currentIndex + 1 < cards.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setCompleted(true);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setShowAnswer(false);
    setCompleted(false);
  };

  if (completed) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '20px',
        padding: '60px 20px',
        maxWidth: '600px',
        margin: '0 auto',
        textAlign: 'center'
      }}>
        <div style={{ background: 'rgba(16, 185, 129, 0.15)', padding: '24px', borderRadius: '50%', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
          <CheckCircle size={56} color="var(--anki-green)" />
        </div>
        <h2 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--anki-text)' }}>Chúc mừng! Bạn đã hoàn thành các thẻ hôm nay!</h2>
        <p style={{ fontSize: '14px', color: 'var(--anki-text-muted)' }}>
          Tất cả các thẻ trong bộ luyện tập này đã được ôn luyện theo thuật toán FSRS.
        </p>
        <button
          onClick={handleRestart}
          className="anki-btn"
          style={{ background: 'var(--anki-blue)', color: '#fff', border: 'none', padding: '10px 24px', fontSize: '15px' }}
        >
          <RotateCcw size={16} />
          Ôn Luyện Lại
        </button>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      width: '100%',
      maxWidth: '750px',
      margin: '0 auto'
    }}>
      {/* Top Review Header with Counts */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Layers size={22} color="var(--anki-blue)" />
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--anki-text)' }}>Ôn Thẻ Flashcard FSRS</h2>
        </div>

        {/* Counter Badge */}
        <div style={{ display: 'flex', gap: '16px', fontSize: '14px', fontWeight: '700' }}>
          <span style={{ color: 'var(--anki-blue)' }}>New: {cards.length - currentIndex}</span>
          <span style={{ color: 'var(--anki-red)' }}>Learn: 0</span>
          <span style={{ color: 'var(--anki-green)' }}>Due: {currentIndex}</span>
        </div>
      </div>

      {/* Main Flashcard View */}
      {currentCard && (
        <div
          onClick={() => !showAnswer && setShowAnswer(true)}
          style={{
            background: 'var(--anki-card-bg)',
            borderRadius: '16px',
            border: '1px solid var(--anki-border)',
            minHeight: '320px',
            padding: '36px 28px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center',
            cursor: showAnswer ? 'default' : 'pointer',
            boxShadow: 'var(--anki-shadow)',
            position: 'relative',
            userSelect: 'none'
          }}
        >
          {/* Front Side: Japanese Word */}
          <div style={{ fontSize: '42px', fontWeight: '700', color: 'var(--anki-text)', fontFamily: "'Noto Sans JP', sans-serif" }}>
            {currentCard.word}
          </div>

          {!showAnswer ? (
            <div style={{ marginTop: '40px', fontSize: '13px', color: 'var(--anki-text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Eye size={16} /> Click hoặc nhấn [Phím Cách] để xem đáp án
            </div>
          ) : (
            <>
              {/* Divider */}
              <div style={{ width: '80%', height: '1px', background: 'var(--anki-border)', margin: '24px 0' }} />

              {/* Back Side: Reading, Meaning & Example */}
              <div style={{ fontSize: '22px', color: 'var(--anki-blue)', fontWeight: '600', fontFamily: "'Noto Sans JP', sans-serif", marginBottom: '8px' }}>
                {currentCard.reading}
              </div>
              <div style={{ fontSize: '20px', color: 'var(--anki-green)', fontWeight: '600', marginBottom: '16px' }}>
                {currentCard.meaningVi}
              </div>

              {currentCard.exampleSentenceJa && (
                <div style={{ background: 'var(--anki-card-sub)', padding: '12px 18px', borderRadius: '8px', width: '100%', maxWidth: '550px', border: '1px solid var(--anki-border)' }}>
                  <div style={{ fontSize: '15px', color: 'var(--anki-text)', fontFamily: "'Noto Sans JP', sans-serif" }}>
                    {currentCard.exampleSentenceJa}
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--anki-text-muted)', marginTop: '4px' }}>
                    {currentCard.exampleSentenceVi}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Action Rating Buttons Bar (Anki Style) */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '10px' }}>
        {!showAnswer ? (
          <button
            onClick={() => setShowAnswer(true)}
            className="anki-btn"
            style={{
              background: 'var(--anki-blue)',
              color: '#ffffff',
              border: 'none',
              padding: '12px 48px',
              fontSize: '15px',
              fontWeight: '600',
              borderRadius: '8px',
              boxShadow: '0 4px 14px rgba(2,132,199,0.3)'
            }}
          >
            Hiển Thị Đáp Án (Space)
          </button>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', width: '100%' }}>
            <button
              onClick={() => handleRating('again')}
              className="anki-btn"
              style={{ background: 'var(--anki-red)', color: '#fff', border: 'none', flexDirection: 'column', gap: '2px', padding: '10px 0' }}
            >
              <span style={{ fontSize: '11px', opacity: 0.8 }}>&lt; 10 phút (1)</span>
              <span style={{ fontWeight: '700', fontSize: '14px' }}>Học Lại</span>
            </button>

            <button
              onClick={() => handleRating('hard')}
              className="anki-btn"
              style={{ background: 'var(--anki-amber)', color: '#fff', border: 'none', flexDirection: 'column', gap: '2px', padding: '10px 0' }}
            >
              <span style={{ fontSize: '11px', opacity: 0.8 }}>1 ngày (2)</span>
              <span style={{ fontWeight: '700', fontSize: '14px' }}>Khó</span>
            </button>

            <button
              onClick={() => handleRating('good')}
              className="anki-btn"
              style={{ background: 'var(--anki-green)', color: '#fff', border: 'none', flexDirection: 'column', gap: '2px', padding: '10px 0' }}
            >
              <span style={{ fontSize: '11px', opacity: 0.8 }}>3 ngày (3)</span>
              <span style={{ fontWeight: '700', fontSize: '14px' }}>Tốt</span>
            </button>

            <button
              onClick={() => handleRating('easy')}
              className="anki-btn"
              style={{ background: 'var(--anki-blue)', color: '#fff', border: 'none', flexDirection: 'column', gap: '2px', padding: '10px 0' }}
            >
              <span style={{ fontSize: '11px', opacity: 0.8 }}>7 ngày (4)</span>
              <span style={{ fontWeight: '700', fontSize: '14px' }}>Dễ</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
