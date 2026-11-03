import React, { useState, useEffect, useCallback } from 'react';
import { GrammarStudyItem } from '../../../types';
import { api } from '../../../services/apiConfig';
import {
  X,
  Volume2,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Trophy,
  Loader2
} from 'lucide-react';

export interface GrammarStudyModalProps {
  initialLevel?: string;
  onClose: () => void;
  onSessionComplete?: () => void;
}

export const GrammarStudyModal: React.FC<GrammarStudyModalProps> = ({
  initialLevel = 'N3',
  onClose,
  onSessionComplete
}) => {
  const [level, setLevel] = useState<string>(initialLevel === 'ALL' ? 'N3' : initialLevel);
  const [queue, setQueue] = useState<GrammarStudyItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isFinished, setIsFinished] = useState<boolean>(false);

  // Direction: 'ja_to_vi' (Nhật -> Việt) or 'vi_to_ja' (Việt -> Nhật)
  const [studyDirection, setStudyDirection] = useState<'ja_to_vi' | 'vi_to_ja'>('ja_to_vi');

  // Stats
  const [totalInitialItems, setTotalInitialItems] = useState<number>(5);
  const [againCount, setAgainCount] = useState<number>(0);
  const [goodCount, setGoodCount] = useState<number>(0);

  const loadSession = useCallback(async (selectedLevel: string) => {
    setIsLoading(true);
    setIsFinished(false);
    setIsAnswerRevealed(false);
    setCurrentIndex(0);
    setAgainCount(0);
    setGoodCount(0);

    const items = await api.getGrammarStudySession(selectedLevel, 5);
    setQueue(items);
    setTotalInitialItems(items.length);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadSession(level);
  }, [level, loadSession]);

  const currentItem: GrammarStudyItem | undefined = queue[currentIndex];

  const handlePlayAudio = (e: React.MouseEvent, text: string) => {
    e.stopPropagation();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text.replace(/[～~+]/g, ''));
      utterance.lang = 'ja-JP';
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleRevealAnswer = useCallback(() => {
    setIsAnswerRevealed(true);
  }, []);

  const handleRate = useCallback(async (rating: 'Again' | 'Hard' | 'Good' | 'Easy') => {
    if (!currentItem) return;

    // Send review rating to backend FSRS engine
    api.submitGrammarReview(currentItem.id, rating);

    if (rating === 'Again') {
      setAgainCount((prev) => prev + 1);
      // Re-insert this card to the end of the queue so user reviews it again in this session
      setQueue((prev) => [...prev, currentItem]);
    } else {
      setGoodCount((prev) => prev + 1);
    }

    setIsAnswerRevealed(false);

    if (currentIndex + 1 < queue.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsFinished(true);
      if (onSessionComplete) onSessionComplete();
    }
  }, [currentItem, currentIndex, queue.length, onSessionComplete]);

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      if (isFinished || isLoading) return;

      if (!isAnswerRevealed) {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          handleRevealAnswer();
        }
      } else {
        if (e.key === '1') handleRate('Again');
        else if (e.key === '2') handleRate('Hard');
        else if (e.key === '3') handleRate('Good');
        else if (e.key === '4') handleRate('Easy');
        else if (e.key === ' ' || e.key === 'Enter') handleRate('Good');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAnswerRevealed, isFinished, isLoading, handleRevealAnswer, handleRate, onClose]);

  const progressPercent = totalInitialItems > 0
    ? Math.min(100, Math.round((Math.min(currentIndex, totalInitialItems) / totalInitialItems) * 100))
    : 0;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-box"
        style={{
          maxWidth: '820px',
          width: '94%',
          padding: '28px 36px',
          background: '#FFFFFF',
          borderRadius: '18px',
          boxShadow: 'var(--shadow-modal)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header: Title, Level Selector & Close */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <h3 style={{ fontFamily: 'var(--font-grotesk)', fontSize: '1.4rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap' }}>
              <span>🎓 Ôn Tập Ngữ Pháp Anki (5 mẫu)</span>
            </h3>

            {/* Level Selector */}
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              disabled={isLoading}
              className="form-select"
              style={{
                padding: '6px 12px',
                fontSize: '0.86rem',
                fontWeight: 800,
                background: '#FEF08A',
                color: '#713F12',
                border: '2px solid #0F172A',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              <option value="ALL">Tất cả cấp độ</option>
              <option value="N5">Cấp N5</option>
              <option value="N4">Cấp N4</option>
              <option value="N3">Cấp N3</option>
              <option value="N2">Cấp N2</option>
              <option value="N1">Cấp N1</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              type="button"
              onClick={() => setStudyDirection(studyDirection === 'ja_to_vi' ? 'vi_to_ja' : 'ja_to_vi')}
              title="Đổi chiều ôn tập: Nhật -> Việt hoặc Việt -> Nhật"
              className="btn-tactile sm"
              style={{ fontSize: '0.8rem', padding: '5px 12px', fontWeight: 700 }}
            >
              {studyDirection === 'ja_to_vi' ? '🇯🇵 ➔ 🇻🇳' : '🇻🇳 ➔ 🇯🇵'}
            </button>

            <button type="button" className="btn-tactile sm icon-only" onClick={onClose} title="Đóng">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Progress Tracker */}
        {!isFinished && !isLoading && totalInitialItems > 0 && (
          <div style={{ marginBottom: '22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 700, color: 'var(--ink-secondary)', marginBottom: '6px' }}>
              <span>Thẻ {Math.min(currentIndex + 1, queue.length)} / {queue.length}</span>
              <span>Độ hoàn thành: {progressPercent}%</span>
            </div>
            <div style={{ width: '100%', height: '10px', background: '#E2E8F0', borderRadius: '999px', overflow: 'hidden', border: '1.5px solid #0F172A' }}>
              <div
                style={{
                  width: `${progressPercent}%`,
                  height: '100%',
                  background: 'var(--accent-pine)',
                  transition: 'width 0.25s ease'
                }}
              />
            </div>
          </div>
        )}

        {/* Modal Body */}
        {isLoading ? (
          <div style={{ padding: '80px 0', textAlign: 'center', color: 'var(--ink-secondary)' }}>
            <Loader2 size={36} className="animate-spin" style={{ margin: '0 auto 14px' }} />
            <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>Đang nạp 5 mẫu ngữ pháp ưu tiên...</div>
          </div>
        ) : isFinished ? (
          /* Session Completion View */
          <div style={{ textAlign: 'center', padding: '32px 16px' }}>
            <div style={{ display: 'inline-flex', padding: '18px', background: '#D8F3DC', borderRadius: '50%', border: '2px solid #0F172A', marginBottom: '18px' }}>
              <Trophy size={48} color="var(--accent-pine)" />
            </div>
            <h3 style={{ fontFamily: 'var(--font-grotesk)', fontSize: '1.7rem', fontWeight: 800, marginBottom: '8px' }}>
              Hoàn Thành Session {level}!
            </h3>
            <p style={{ color: 'var(--ink-secondary)', fontSize: '0.98rem', marginBottom: '24px' }}>
              Bạn đã ôn tập xong 5 mẫu ngữ pháp theo thuật toán Spaced Repetition của Anki.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', maxWidth: '380px', margin: '0 auto 28px' }}>
              <div style={{ background: '#F8FAFC', border: '2px solid #0F172A', borderRadius: '10px', padding: '14px' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--ink-secondary)' }}>GHI NHỚ TỐT</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent-pine)' }}>{goodCount}</div>
              </div>
              <div style={{ background: '#F8FAFC', border: '2px solid #0F172A', borderRadius: '10px', padding: '14px' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--ink-secondary)' }}>CẦN ÔN THÊM</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#D97706' }}>{againCount}</div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
              <button
                type="button"
                className="btn-tactile primary lg"
                onClick={() => loadSession(level)}
                style={{ padding: '10px 22px', fontSize: '0.95rem' }}
              >
                <Sparkles size={16} />
                <span>Học tiếp 5 câu nữa</span>
              </button>
              <button
                type="button"
                className="btn-tactile lg"
                onClick={onClose}
                style={{ padding: '10px 22px', fontSize: '0.95rem' }}
              >
                <span>Quay lại kho</span>
              </button>
            </div>
          </div>
        ) : !currentItem ? (
          <div style={{ padding: '50px 0', textAlign: 'center', color: 'var(--ink-secondary)' }}>
            <CheckCircle2 size={40} color="var(--accent-pine)" style={{ margin: '0 auto 14px' }} />
            <div style={{ fontWeight: 700, fontSize: '1.15rem', marginBottom: '8px' }}>
              Kho ngữ pháp cấp {level} chưa có đủ dữ liệu.
            </div>
            <p style={{ fontSize: '0.9rem', color: 'var(--ink-muted)', marginBottom: '20px' }}>
              Hãy thêm thêm mẫu câu hoặc đổi sang cấp độ khác để bắt đầu session học.
            </p>
            <button type="button" className="btn-tactile" onClick={onClose}>Đóng</button>
          </div>
        ) : (
          /* Active Flashcard Study Card */
          <div>
            {/* Main Interactive Card */}
            <div
              className="card-tactile"
              style={{
                padding: '36px 32px',
                textAlign: 'center',
                background: isAnswerRevealed ? '#FFFFFF' : '#FFFDF9',
                borderColor: '#0F172A',
                boxShadow: 'var(--shadow-md)',
                marginBottom: '22px',
                minHeight: '300px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              {/* JLPT Tag & State Badge */}
              <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
                <span
                  style={{
                    background: '#FEF08A',
                    color: '#713F12',
                    border: '1.5px solid #0F172A',
                    padding: '3px 10px',
                    borderRadius: '6px',
                    fontSize: '0.82rem',
                    fontWeight: 800
                  }}
                >
                  {currentItem.jlptLevel}
                </span>

                <span
                  style={{
                    background: currentItem.state === 'NEW' ? '#E0F2FE' : '#D8F3DC',
                    color: currentItem.state === 'NEW' ? '#0369A1' : '#133E2B',
                    border: '1.5px solid #0F172A',
                    padding: '3px 10px',
                    borderRadius: '6px',
                    fontSize: '0.82rem',
                    fontWeight: 700
                  }}
                >
                  {currentItem.state === 'NEW' ? 'Thẻ mới' : `Đã ôn ${currentItem.reps} lần`}
                </span>
              </div>

              {/* Front of Card */}
              {studyDirection === 'ja_to_vi' ? (
                <div>
                  <div
                    style={{
                      fontFamily: 'var(--font-kanji)',
                      fontSize: '3.0rem',
                      fontWeight: 800,
                      color: '#0F172A',
                      marginBottom: '12px',
                      lineHeight: 1.25,
                      letterSpacing: '0.01em'
                    }}
                  >
                    {currentItem.pattern}
                  </div>
                  <div style={{ fontSize: '0.92rem', color: 'var(--ink-secondary)', fontWeight: 600 }}>
                    💡 Hãy nhớ lại <strong>Ý nghĩa tiếng Việt</strong> & <strong>Cấu trúc biến đổi</strong>
                  </div>
                </div>
              ) : (
                <div>
                  <div
                    style={{
                      fontFamily: 'var(--font-grotesk)',
                      fontSize: '1.85rem',
                      fontWeight: 800,
                      color: '#0F172A',
                      marginBottom: '12px',
                      lineHeight: 1.35
                    }}
                  >
                    "{currentItem.meaningVi}"
                  </div>
                  <div style={{ fontSize: '0.92rem', color: 'var(--ink-secondary)', fontWeight: 600 }}>
                    💡 Mẫu ngữ pháp tiếng Nhật tương ứng là gì?
                  </div>
                </div>
              )}

              {/* Back of Card (Revealed) */}
              {isAnswerRevealed && (
                <div
                  style={{
                    width: '100%',
                    marginTop: '24px',
                    paddingTop: '22px',
                    borderTop: '2px dashed #CBD5E1',
                    animation: 'fadeIn 0.2s ease-out'
                  }}
                >
                  {studyDirection === 'ja_to_vi' ? (
                    <div style={{ marginBottom: '16px' }}>
                      <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--ink-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                        Ý NGHĨA TIẾNG VIỆT:
                      </div>
                      <div style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--accent-pine)', lineHeight: 1.3 }}>
                        {currentItem.meaningVi}
                      </div>
                    </div>
                  ) : (
                    <div style={{ marginBottom: '16px' }}>
                      <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--ink-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                        MẪU CÂU TIẾNG NHẬT:
                      </div>
                      <div style={{ fontFamily: 'var(--font-kanji)', fontSize: '2.2rem', fontWeight: 800, color: 'var(--accent-pine)' }}>
                        {currentItem.pattern}
                      </div>
                    </div>
                  )}

                  {/* Structure Badge */}
                  {currentItem.structure && (
                    <div style={{ marginBottom: '16px' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--ink-muted)', textTransform: 'uppercase', marginBottom: '5px' }}>
                        CÔNG THỨC BIẾN ĐỔI:
                      </div>
                      <code
                        style={{
                          background: '#FFE8D6',
                          color: '#0F172A',
                          border: '2px solid #0F172A',
                          padding: '6px 16px',
                          borderRadius: '8px',
                          fontSize: '1.02rem',
                          fontWeight: 700,
                          display: 'inline-block'
                        }}
                      >
                        {currentItem.structure}
                      </code>
                    </div>
                  )}

                  {/* Explanation */}
                  {currentItem.explanation && (
                    <div
                      style={{
                        background: '#F8FAFC',
                        border: '1.5px solid #CBD5E1',
                        borderRadius: '10px',
                        padding: '12px 18px',
                        fontSize: '0.9rem',
                        color: '#334155',
                        textAlign: 'left',
                        lineHeight: 1.6,
                        maxWidth: '620px',
                        margin: '0 auto'
                      }}
                    >
                      <strong style={{ color: '#0F172A' }}>Giải thích: </strong>
                      {currentItem.explanation}
                    </div>
                  )}

                  {/* Audio Speech Button */}
                  <div style={{ marginTop: '14px' }}>
                    <button
                      type="button"
                      onClick={(e) => handlePlayAudio(e, currentItem.pattern)}
                      className="btn-tactile sm"
                      style={{ padding: '6px 16px', fontSize: '0.82rem', fontWeight: 700 }}
                    >
                      <Volume2 size={16} />
                      <span>Nghe phát âm</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Controls */}
            {!isAnswerRevealed ? (
              <div>
                <button
                  type="button"
                  onClick={handleRevealAnswer}
                  className="btn-tactile primary lg"
                  style={{ width: '100%', height: '56px', fontSize: '1.15rem', fontWeight: 800 }}
                >
                  <span>Xem Đáp Án (Phím Space)</span>
                  <ArrowRight size={20} />
                </button>
              </div>
            ) : (
              /* Anki 4 Rating Buttons */
              <div>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--ink-secondary)', textAlign: 'center', marginBottom: '10px' }}>
                  ĐÁNH GIÁ MỨC ĐỘ GHI NHỚ THEO ANKI:
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                  {/* [1] Again */}
                  <button
                    type="button"
                    onClick={() => handleRate('Again')}
                    className="btn-tactile"
                    style={{
                      background: '#FEE2E2',
                      borderColor: '#0F172A',
                      color: '#991B1B',
                      flexDirection: 'column',
                      padding: '12px 8px',
                      gap: '3px'
                    }}
                  >
                    <span style={{ fontSize: '0.96rem', fontWeight: 800 }}>Again</span>
                    <span style={{ fontSize: '0.74rem', fontWeight: 600 }}>&lt; 10 phút</span>
                    <span style={{ fontSize: '0.68rem', opacity: 0.6 }}>(Phím 1)</span>
                  </button>

                  {/* [2] Hard */}
                  <button
                    type="button"
                    onClick={() => handleRate('Hard')}
                    className="btn-tactile"
                    style={{
                      background: '#FFEDD5',
                      borderColor: '#0F172A',
                      color: '#9A3412',
                      flexDirection: 'column',
                      padding: '12px 8px',
                      gap: '3px'
                    }}
                  >
                    <span style={{ fontSize: '0.96rem', fontWeight: 800 }}>Hard</span>
                    <span style={{ fontSize: '0.74rem', fontWeight: 600 }}>1 ngày</span>
                    <span style={{ fontSize: '0.68rem', opacity: 0.6 }}>(Phím 2)</span>
                  </button>

                  {/* [3] Good */}
                  <button
                    type="button"
                    onClick={() => handleRate('Good')}
                    className="btn-tactile"
                    style={{
                      background: '#D8F3DC',
                      borderColor: '#0F172A',
                      color: '#133E2B',
                      flexDirection: 'column',
                      padding: '12px 8px',
                      gap: '3px'
                    }}
                  >
                    <span style={{ fontSize: '0.96rem', fontWeight: 800 }}>Good</span>
                    <span style={{ fontSize: '0.74rem', fontWeight: 600 }}>3-4 ngày</span>
                    <span style={{ fontSize: '0.68rem', opacity: 0.6 }}>(Phím 3)</span>
                  </button>

                  {/* [4] Easy */}
                  <button
                    type="button"
                    onClick={() => handleRate('Easy')}
                    className="btn-tactile"
                    style={{
                      background: '#CFFAFE',
                      borderColor: '#0F172A',
                      color: '#155E75',
                      flexDirection: 'column',
                      padding: '12px 8px',
                      gap: '3px'
                    }}
                  >
                    <span style={{ fontSize: '0.96rem', fontWeight: 800 }}>Easy</span>
                    <span style={{ fontSize: '0.74rem', fontWeight: 600 }}>7 ngày</span>
                    <span style={{ fontSize: '0.68rem', opacity: 0.6 }}>(Phím 4)</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
