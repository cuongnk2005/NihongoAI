import React, { useState, useEffect } from 'react';
import { RotateCcw, CheckCircle, ArrowLeft, Volume2 } from 'lucide-react';

interface Flashcard {
  id: number;
  word: string;
  reading: string;
  meaningVi: string;
  partOfSpeech?: string;
  jlptLevel?: string;
  exampleSentenceJa?: string;
  exampleSentenceVi?: string;
  intervalDays?: number;
  reps?: number;
}

const defaultCards: Flashcard[] = [
  {
    id: 1,
    word: '食べる',
    reading: 'たべる • taberu',
    meaningVi: 'ăn (dùng bữa, dùng cơm)',
    partOfSpeech: 'Động từ nhóm 2',
    jlptLevel: 'N5',
    exampleSentenceJa: '毎朝、パンと卵を食べます。',
    exampleSentenceVi: 'Mỗi sáng tôi đều ăn bánh mì và trứng.',
    intervalDays: 4,
    reps: 6
  },
  {
    id: 2,
    word: '見る',
    reading: 'みる • miru',
    meaningVi: 'nhìn, xem, ngắm',
    partOfSpeech: 'Động từ nhóm 2',
    jlptLevel: 'N5',
    exampleSentenceJa: '昨日、友達と映画を見ました。',
    exampleSentenceVi: 'Hôm qua tôi đã xem phim với bạn bè.',
    intervalDays: 3,
    reps: 5
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
    intervalDays: 1,
    reps: 2
  },
  {
    id: 4,
    word: '約束',
    reading: 'やくそく • yakusoku',
    meaningVi: 'lời hứa, cuộc hẹn',
    partOfSpeech: 'Danh từ',
    jlptLevel: 'N4',
    exampleSentenceJa: '友達と約束があります。',
    exampleSentenceVi: 'Tôi có một cuộc hẹn với bạn bè.',
    intervalDays: 0,
    reps: 0
  },
  {
    id: 5,
    word: '美しい',
    reading: 'うつくしい • utsukushii',
    meaningVi: 'đẹp đẽ, tuyệt mỹ, thanh khiết',
    partOfSpeech: 'Tính từ đuôi い',
    jlptLevel: 'N3',
    exampleSentenceJa: '富士山の夕焼けは本当に美しいです。',
    exampleSentenceVi: 'Hoàng hôn trên núi Phú Sĩ thực sự rất đẹp.',
    intervalDays: 7,
    reps: 8
  }
];

interface ReviewPageProps {
  onBackToDecks?: () => void;
}

export const ReviewPage: React.FC<ReviewPageProps> = ({ onBackToDecks }) => {
  const [cards] = useState<Flashcard[]>(defaultCards);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [showAnswer, setShowAnswer] = useState<boolean>(false);
  const [completed, setCompleted] = useState<boolean>(false);
  const [history, setHistory] = useState<number[]>([]);

  const currentCard = cards[currentIndex];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (completed) return;
      if (e.code === 'Space' || e.code === 'Enter') {
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

  const handleRating = (_rating: 'again' | 'hard' | 'good' | 'easy') => {
    setHistory((prev) => [...prev, currentIndex]);
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
    setHistory([]);
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const prevIndex = history[history.length - 1];
    setHistory((prev) => prev.slice(0, -1));
    setCurrentIndex(prevIndex);
    setShowAnswer(false);
    setCompleted(false);
  };

  const playSpeech = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ja-JP';
      window.speechSynthesis.speak(utterance);
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

  const progressPercent = Math.round(((currentIndex) / cards.length) * 100);

  return (
    <div style={{ width: '100%' }}>
      {/* Daily Queue HUD */}
      <div className="queue-hud">
        <div className="deck-info">
          {onBackToDecks && (
            <button 
              className="btn-tactile sm" 
              onClick={onBackToDecks}
              style={{ marginRight: '8px' }}
              title="Quay lại danh sách bộ thẻ"
            >
              <ArrowLeft size={14} />
            </button>
          )}
          <span style={{ fontSize: '0.85rem', color: 'var(--ink-secondary)', fontWeight: 700 }}>
            BỘ THẺ:
          </span>
          <span className="deck-title">Minna no Nihongo (Bài 1 - 25)</span>
        </div>
        <div className="queue-chips">
          <div className="chip new">Mới: <span>{Math.max(0, 2 - Math.floor(currentIndex / 2))}</span></div>
          <div className="chip learning">Đang học: <span>1</span></div>
          <div className="chip review">Cần ôn: <span>{cards.length - currentIndex}</span></div>
        </div>
      </div>

      {/* Speed Flashcard Interactive Stage */}
      <div className="card-stage">
        <div 
          className="flashcard-tactile"
          onClick={() => setShowAnswer((prev) => !prev)}
        >
          {/* Card Top Meta */}
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <span className="meta-pill">{currentCard.jlptLevel || 'N5'}</span>
              {currentCard.partOfSpeech && (
                <span className="meta-pill" style={{ background: '#E2E8F0', color: '#0F172A' }}>
                  {currentCard.partOfSpeech}
                </span>
              )}
            </div>
            <button 
              className="btn-tactile sm"
              style={{ padding: '4px 8px' }}
              onClick={(e) => {
                e.stopPropagation();
                playSpeech(currentCard.word);
              }}
              title="Phát âm tiếng Nhật"
            >
              <Volume2 size={16} />
            </button>
          </div>

          {/* Card Center: Hero Kanji & Flipped Content */}
          <div className="card-center-body">
            <h1 className="kanji-hero">{currentCard.word}</h1>

            <div className="reading-ruby-box" style={{ visibility: showAnswer ? 'visible' : 'hidden' }}>
              {currentCard.reading}
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
          </div>

          {/* Flip Cue Prompt */}
          <div className="flip-cue">
            <span>{showAnswer ? 'Chọn đánh giá FSRS bên dưới hoặc bấm phím số' : 'Nhấp vào thẻ hoặc nhấn'}</span>
            <span className="kbd-badge">{showAnswer ? '1 • 2 • 3 • 4' : 'Space / Enter'}</span>
          </div>
        </div>
      </div>

      {/* FSRS 4 Rating Controls (Visible when answered) */}
      <div 
        className="rating-deck"
        style={{ 
          opacity: showAnswer ? 1 : 0.45, 
          pointerEvents: showAnswer ? 'auto' : 'none',
          transition: 'opacity 0.15s ease' 
        }}
      >
        <button 
          className="rating-btn again"
          onClick={() => handleRating('again')}
        >
          <span className="rating-keycap">1</span>
          <span className="rating-title" style={{ color: 'var(--accent-vermilion)' }}>Again</span>
          <span className="rating-interval">&lt; 10 phút</span>
        </button>

        <button 
          className="rating-btn hard"
          onClick={() => handleRating('hard')}
        >
          <span className="rating-keycap">2</span>
          <span className="rating-title" style={{ color: 'var(--accent-amber)' }}>Hard</span>
          <span className="rating-interval">12 giờ</span>
        </button>

        <button 
          className="rating-btn good"
          onClick={() => handleRating('good')}
        >
          <span className="rating-keycap">3</span>
          <span className="rating-title" style={{ color: 'var(--accent-pine)' }}>Good</span>
          <span className="rating-interval">1 ngày</span>
        </button>

        <button 
          className="rating-btn easy"
          onClick={() => handleRating('easy')}
        >
          <span className="rating-keycap">4</span>
          <span className="rating-title" style={{ color: 'var(--accent-cobalt)' }}>Easy</span>
          <span className="rating-interval">3 ngày</span>
        </button>
      </div>

      {/* Bottom Progress & Undo Bar */}
      <div 
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 18px',
          background: 'var(--bg-surface)',
          border: 'var(--border-dark)',
          borderRadius: 'var(--radius-box)',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        <button 
          className="btn-tactile sm" 
          onClick={handleUndo}
          disabled={history.length === 0}
          style={{ opacity: history.length === 0 ? 0.5 : 1 }}
        >
          <RotateCcw size={14} />
          <span>Hoàn tác (Undo)</span>
        </button>

        {/* Progress Track */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, maxWidth: '420px', margin: '0 20px' }}>
          <div 
            style={{
              flex: 1,
              height: '10px',
              background: 'var(--bg-stone)',
              border: 'var(--border-dark)',
              borderRadius: 'var(--radius-pill)',
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
          <span style={{ fontSize: '0.85rem', fontWeight: 700, fontFamily: 'var(--font-grotesk)' }}>
            {currentIndex + 1} / {cards.length}
          </span>
        </div>

        <button 
          className="btn-tactile sm"
          onClick={() => setShowAnswer((prev) => !prev)}
        >
          <span>{showAnswer ? 'Ẩn đáp án' : 'Hiện đáp án'}</span>
        </button>
      </div>
    </div>
  );
};
