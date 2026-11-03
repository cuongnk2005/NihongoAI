import React, { useState, useRef } from 'react';
import { usePractice } from '../hooks/usePractice';
import { useTextLookup } from '../../../hooks/useTextLookup';
import { KanjiLookupPopover } from '../../../components/KanjiLookupPopover';
import {
  Send,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Volume2,
  Lightbulb,
  Eye,
  EyeOff,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Search
} from 'lucide-react';

export const PracticePage: React.FC = () => {
  const {
    level,
    setLevel,
    question,
    userAnswer,
    setUserAnswer,
    isLoading,
    isEvaluating,
    evaluation,
    sessionHistory,
    generateNewQuestion,
    submitEvaluation,
    retryCurrentQuestion,
    insertToken,
    playSpeech
  } = usePractice('N4');

  const { lookupResult, position, closeLookup, handleMouseUp, handleInputSelect } = useTextLookup();

  const [isComposing, setIsComposing] = useState<boolean>(false);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [showSampleAnswer, setShowSampleAnswer] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleEvaluate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isComposing) return;
    await submitEvaluation();
  };

  const handleGenerate = async () => {
    setShowHint(false);
    setShowSampleAnswer(false);
    await generateNewQuestion();
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleRetry = () => {
    retryCurrentQuestion();
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleInsertChip = (tag: string) => {
    insertToken(tag);
    inputRef.current?.focus();
  };

  const avgScore =
    sessionHistory.length > 0
      ? Math.round(sessionHistory.reduce((sum, item) => sum + item.evaluation.score, 0) / sessionHistory.length)
      : null;

  return (
    <div
      onMouseUp={handleMouseUp}
      style={{ width: '100%', maxWidth: '880px', margin: '0 auto', position: 'relative' }}
    >
      {/* Popover Tra Từ Nhanh Khi Bôi Đen */}
      {lookupResult && (
        <KanjiLookupPopover
          result={lookupResult}
          position={position}
          onClose={closeLookup}
        />
      )}

      {/* Page Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <div>
          <h2 style={{ fontFamily: 'var(--font-grotesk)', fontSize: '1.6rem', fontWeight: 700, marginBottom: '4px' }}>
            ✍️ Luyện Dịch Câu (Active Production)
          </h2>
          <p style={{ color: 'var(--ink-secondary)', fontSize: '0.9rem', marginBottom: '2px' }}>
            AI tạo đề bài tiếng Việt kích thích phản xạ sử dụng từ vựng & ngữ pháp mục tiêu, kiểm tra IME tiếng Nhật.
          </p>
          <p style={{ fontSize: '0.8rem', color: '#B45309', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Search size={13} />
            <span>Mẹo: Bạn có thể <strong>bôi đen bất kỳ chữ Kanji / từ tiếng Nhật</strong> trên màn hình để tra cứu nghĩa Hán Việt tức thì!</span>
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          {sessionHistory.length > 0 && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 12px',
                borderRadius: '8px',
                background: '#F1F5F9',
                border: '1.5px solid #CBD5E1',
                fontSize: '0.82rem',
                fontWeight: 700,
                color: '#0F172A'
              }}
            >
              <span>Đã luyện: {sessionHistory.length} câu</span>
              <span style={{ color: '#94A3B8' }}>•</span>
              <span style={{ color: (avgScore ?? 0) >= 80 ? 'var(--accent-pine)' : '#D97706' }}>
                TB: {avgScore}/100
              </span>
            </div>
          )}

          <select
            value={level}
            onChange={(e) => {
              setShowHint(false);
              setShowSampleAnswer(false);
              setLevel(e.target.value);
            }}
            className="form-select"
            style={{ width: '115px', padding: '8px 12px', fontWeight: 700 }}
          >
            <option value="N5">Cấp N5</option>
            <option value="N4">Cấp N4</option>
            <option value="N3">Cấp N3</option>
            <option value="N2">Cấp N2</option>
            <option value="N1">Cấp N1</option>
          </select>

          <button onClick={handleGenerate} disabled={isLoading} className="btn-tactile">
            <RefreshCw size={15} className={isLoading ? 'animate-spin' : ''} />
            <span>{isLoading ? 'Đang tạo...' : 'Đổi Đề Bài'}</span>
          </button>
        </div>
      </div>

      {/* Main Practice Container */}
      {question && (
        <div className="card-tactile" style={{ padding: '32px 36px', marginBottom: '24px' }}>
          {/* Vietnamese Sentence Prompt Card */}
          <div
            style={{
              background: '#FFE8D6',
              border: 'var(--border-dark)',
              borderRadius: 'var(--radius-btn)',
              boxShadow: 'var(--shadow-sm)',
              padding: '22px 24px',
              marginBottom: '22px'
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '8px',
                flexWrap: 'wrap',
                gap: '8px'
              }}
            >
              <span
                style={{
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  color: 'var(--ink-secondary)',
                  letterSpacing: '0.03em'
                }}
              >
                Đề bài Tiếng Việt ({question.difficulty}):
              </span>

              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                {question.hintVi && (
                  <button
                    type="button"
                    onClick={() => setShowHint((prev) => !prev)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      border: '1.5px solid #0F172A',
                      background: showHint ? '#FEF08A' : '#FFFFFF',
                      color: '#0F172A',
                      fontSize: '0.76rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    <Lightbulb size={13} />
                    <span>{showHint ? 'Ẩn gợi ý' : 'Gợi ý cấu trúc'}</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setShowSampleAnswer((prev) => !prev)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    border: '1.5px solid #0F172A',
                    background: showSampleAnswer ? '#D8F3DC' : '#FFFFFF',
                    color: '#0F172A',
                    fontSize: '0.76rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {showSampleAnswer ? <EyeOff size={13} /> : <Eye size={13} />}
                  <span>{showSampleAnswer ? 'Ẩn đáp án mẫu' : 'Xem đáp án mẫu'}</span>
                </button>
              </div>
            </div>

            <div style={{ fontSize: '1.42rem', fontWeight: 700, color: '#0F172A', marginBottom: '16px', lineHeight: 1.4 }}>
              "{question.sentenceVi}"
            </div>

            {/* Target Knowledge Tags (Clickable to insert) */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--ink-secondary)' }}>
                Kiến thức mục tiêu <span style={{ fontWeight: 500 }}>(nhấn để chèn)</span>:
              </span>
              {question.targetVocabulary.map((v, i) => (
                <button
                  key={`v-${i}`}
                  type="button"
                  onClick={() => handleInsertChip(v)}
                  className="meta-pill"
                  title="Nhấn để chèn nhanh từ vựng này vào ô trả lời"
                  style={{
                    background: '#FFFFFF',
                    color: '#0F172A',
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                    transition: 'transform 0.1s ease'
                  }}
                >
                  + Từ vựng: {v}
                </button>
              ))}
              {question.targetGrammar.map((g, i) => (
                <button
                  key={`g-${i}`}
                  type="button"
                  onClick={() => handleInsertChip(g)}
                  className="meta-pill"
                  title="Nhấn để chèn nhanh mẫu ngữ pháp này vào ô trả lời"
                  style={{
                    background: '#D8F3DC',
                    color: '#133E2B',
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                    transition: 'transform 0.1s ease'
                  }}
                >
                  + Ngữ pháp: {g}
                </button>
              ))}
            </div>

            {/* Optional Hint Collapse */}
            {showHint && question.hintVi && (
              <div
                style={{
                  marginTop: '14px',
                  padding: '10px 14px',
                  background: '#FFFBEB',
                  border: '1.5px solid #F59E0B',
                  borderRadius: '8px',
                  fontSize: '0.86rem',
                  color: '#78350F',
                  fontWeight: 600
                }}
              >
                💡 <strong>Gợi ý:</strong> {question.hintVi}
              </div>
            )}

            {/* Optional Sample Answer Collapse */}
            {showSampleAnswer && (
              <div
                style={{
                  marginTop: '12px',
                  padding: '10px 14px',
                  background: '#FFFFFF',
                  border: '1.5px solid #0F172A',
                  borderRadius: '8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '12px',
                  flexWrap: 'wrap'
                }}
              >
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--accent-pine)', fontFamily: 'var(--font-kanji)' }}>
                  Đáp án tham khảo: {question.exampleAnswerJa}
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => playSpeech(question.exampleAnswerJa)}
                    className="btn-tactile sm"
                    style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                  >
                    <Volume2 size={14} />
                    <span>Nghe</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setUserAnswer(question.exampleAnswerJa);
                      inputRef.current?.focus();
                    }}
                    className="btn-tactile sm"
                    style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                  >
                    <Sparkles size={14} />
                    <span>Điền vào ô</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Answer Input Section */}
          <form onSubmit={handleEvaluate}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--ink-primary)' }}>
                Nhập câu trả lời bằng Tiếng Nhật của bạn:
              </label>
              <div
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  padding: '3px 8px',
                  border: 'var(--border-dark)',
                  borderRadius: '4px',
                  background: isComposing ? '#FEF08A' : '#E2E8F0',
                  color: isComposing ? '#713F12' : '#0F172A'
                }}
              >
                {isComposing ? '⌨️ Đang gõ IME...' : '✓ IME Sẵn sàng'}
              </div>
            </div>

            <div style={{ marginBottom: '18px' }}>
              <input
                ref={inputRef}
                type="text"
                className="japanese-answer-input"
                placeholder="Gõ câu dịch tiếng Nhật của bạn vào đây (Nhấn Enter để nộp bài)..."
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                onSelect={handleInputSelect}
                onCompositionStart={() => setIsComposing(true)}
                onCompositionEnd={() => setIsComposing(false)}
                disabled={isEvaluating}
                autoFocus
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                {userAnswer.trim() && (
                  <button
                    type="button"
                    onClick={() => {
                      setUserAnswer('');
                      inputRef.current?.focus();
                    }}
                    className="btn-tactile sm"
                    style={{ fontSize: '0.82rem' }}
                  >
                    Xóa nội dung
                  </button>
                )}
              </div>

              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                {evaluation && (
                  <button
                    type="button"
                    onClick={handleGenerate}
                    className="btn-tactile lg"
                    style={{ background: '#FEF08A', color: '#0F172A' }}
                  >
                    <span>Câu tiếp theo</span>
                    <ArrowRight size={18} />
                  </button>
                )}

                <button
                  type="submit"
                  disabled={isEvaluating || !userAnswer.trim()}
                  className="btn-tactile primary lg"
                  style={{ opacity: !userAnswer.trim() || isEvaluating ? 0.6 : 1 }}
                >
                  <Send size={18} />
                  <span>{isEvaluating ? 'AI Đang Chấm Điểm...' : 'Nộp Bài & Chấm Điểm AI'}</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* AI Evaluation Feedback Card */}
      {evaluation && (
        <div
          className="card-tactile"
          style={{
            borderColor: evaluation.correct ? 'var(--accent-pine)' : 'var(--accent-vermilion)',
            boxShadow: 'var(--shadow-lg)',
            padding: '28px',
            marginBottom: '24px'
          }}
        >
          {/* Score Banner */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
              flexWrap: 'wrap',
              gap: '12px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {evaluation.correct ? (
                <CheckCircle2 size={32} color="var(--accent-pine)" />
              ) : (
                <AlertCircle size={32} color="var(--accent-vermilion)" />
              )}
              <div>
                <h3 style={{ fontFamily: 'var(--font-grotesk)', fontSize: '1.4rem', fontWeight: 700 }}>
                  {evaluation.score >= 90
                    ? 'Đạt Yêu Cầu Xuất Sắc!'
                    : evaluation.correct
                    ? 'Đạt Yêu Cầu Tốt!'
                    : 'Cần Chỉnh Sửa Cho Đúng Cấu Trúc'}
                </h3>
                <span style={{ fontSize: '0.85rem', color: 'var(--ink-secondary)' }}>
                  Đánh giá chi tiết bởi trợ lý AI NihongoAI
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
              <span
                style={{
                  fontFamily: 'var(--font-grotesk)',
                  fontSize: '2.4rem',
                  fontWeight: 900,
                  color: evaluation.correct ? 'var(--accent-pine)' : 'var(--accent-vermilion)'
                }}
              >
                {evaluation.score}
              </span>
              <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--ink-secondary)' }}>/ 100</span>
            </div>
          </div>

          {/* Sub-Scores Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px' }}>
            <div
              style={{
                background: 'var(--bg-subtle)',
                border: 'var(--border-dark)',
                borderRadius: 'var(--radius-btn)',
                padding: '12px',
                textAlign: 'center'
              }}
            >
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--ink-secondary)' }}>Ý NGHĨA SEMANTIC</div>
              <div style={{ fontFamily: 'var(--font-grotesk)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent-cobalt)' }}>
                {evaluation.meaningScore}%
              </div>
            </div>
            <div
              style={{
                background: 'var(--bg-subtle)',
                border: 'var(--border-dark)',
                borderRadius: 'var(--radius-btn)',
                padding: '12px',
                textAlign: 'center'
              }}
            >
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--ink-secondary)' }}>NGỮ PHÁP BIẾN ĐỔI</div>
              <div style={{ fontFamily: 'var(--font-grotesk)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent-pine)' }}>
                {evaluation.grammarScore}%
              </div>
            </div>
            <div
              style={{
                background: 'var(--bg-subtle)',
                border: 'var(--border-dark)',
                borderRadius: 'var(--radius-btn)',
                padding: '12px',
                textAlign: 'center'
              }}
            >
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--ink-secondary)' }}>ĐỘ TỰ NHIÊN BẢN XỨ</div>
              <div style={{ fontFamily: 'var(--font-grotesk)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent-amber)' }}>
                {evaluation.naturalnessScore}%
              </div>
            </div>
          </div>

          {/* Grammar & Vocabulary Error Breakdown */}
          {((evaluation.grammarErrors && evaluation.grammarErrors.length > 0) ||
            (evaluation.vocabularyErrors && evaluation.vocabularyErrors.length > 0)) && (
            <div
              style={{
                background: '#FFF5F5',
                border: '1.5px solid #FCA5A5',
                borderRadius: 'var(--radius-btn)',
                padding: '14px 18px',
                marginBottom: '16px'
              }}
            >
              <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#991B1B', marginBottom: '8px', textTransform: 'uppercase' }}>
                Điểm cần lưu ý & chỉnh sửa:
              </div>
              <ul style={{ margin: 0, paddingLeft: '18px', color: '#7F1D1D', fontSize: '0.9rem', lineHeight: 1.6 }}>
                {evaluation.grammarErrors?.map((err, i) => (
                  <li key={`ge-${i}`}>
                    <strong>Ngữ pháp:</strong> {err}
                  </li>
                ))}
                {evaluation.vocabularyErrors?.map((err, i) => (
                  <li key={`ve-${i}`}>
                    <strong>Từ vựng:</strong> {err}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Suggested Answer */}
          <div
            style={{
              background: 'var(--bg-subtle)',
              border: 'var(--border-dark)',
              borderRadius: 'var(--radius-btn)',
              padding: '16px 20px',
              marginBottom: '16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '12px'
            }}
          >
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--ink-secondary)', marginBottom: '4px' }}>
                ĐÁP ÁN GỢI Ý CHUẨN TỪ AI:
              </div>
              <div style={{ fontFamily: 'var(--font-kanji)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent-pine)' }}>
                {evaluation.suggestedAnswer}
              </div>
            </div>
            <button
              type="button"
              className="btn-tactile sm"
              onClick={() => playSpeech(evaluation.suggestedAnswer)}
              title="Phát âm đáp án gợi ý"
            >
              <Volume2 size={16} />
              <span>Nghe phát âm</span>
            </button>
          </div>

          {/* Vietnamese Explanation */}
          <div
            style={{
              fontSize: '0.95rem',
              color: 'var(--ink-primary)',
              lineHeight: '1.6',
              background: '#F8FAFC',
              border: 'var(--border-subtle)',
              padding: '14px 18px',
              borderRadius: 'var(--radius-btn)',
              marginBottom: '18px'
            }}
          >
            <strong style={{ color: 'var(--accent-cobalt)' }}>Giải thích chi tiết: </strong>
            {evaluation.explanationVi}
          </div>

          {/* Quick Next/Retry Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button type="button" onClick={handleRetry} className="btn-tactile">
              <RotateCcw size={15} />
              <span>Thử lại câu này</span>
            </button>
            <button type="button" onClick={handleGenerate} className="btn-tactile primary">
              <span>Câu tiếp theo</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Session History */}
      {sessionHistory.length > 0 && (
        <div className="card-tactile" style={{ padding: '22px 26px' }}>
          <h3 style={{ fontFamily: 'var(--font-grotesk)', fontSize: '1.05rem', fontWeight: 700, marginBottom: '12px' }}>
            📚 Lịch sử câu đã luyện trong phiên ({sessionHistory.length})
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {sessionHistory.slice(0, 5).map((item) => (
              <div
                key={item.id}
                style={{
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: '1.5px solid #E2E8F0',
                  background: '#F8FAFC',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '12px',
                  flexWrap: 'wrap'
                }}
              >
                <div style={{ flex: 1, minWidth: '240px' }}>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0F172A', marginBottom: '2px' }}>
                    {item.question.sentenceVi}
                  </div>
                  <div style={{ fontSize: '0.84rem', color: '#475569', fontFamily: 'var(--font-kanji)' }}>
                    Bạn dịch: <strong style={{ color: '#0F172A' }}>{item.userAnswer}</strong> • Mẫu:{' '}
                    <span style={{ color: 'var(--accent-pine)', fontWeight: 600 }}>{item.evaluation.suggestedAnswer}</span>
                  </div>
                </div>
                <span
                  style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontWeight: 800,
                    fontSize: '0.82rem',
                    background: item.evaluation.correct ? '#D8F3DC' : '#FEE2E2',
                    color: item.evaluation.correct ? '#133E2B' : '#991B1B',
                    border: '1.5px solid #0F172A'
                  }}
                >
                  {item.evaluation.score}/100
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
