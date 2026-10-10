import React, { useState, useEffect } from 'react';
import { api } from '../../../services/apiConfig';
import { PracticeQuestion, EvaluationResult } from '../../../types';
import { Send, RefreshCw, CheckCircle2, AlertCircle, Volume2 } from 'lucide-react';

export const PracticePage: React.FC = () => {
  const [level, setLevel] = useState<string>('N4');
  const [question, setQuestion] = useState<PracticeQuestion | null>(null);
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [isComposing, setIsComposing] = useState<boolean>(false);

  useEffect(() => {
    handleGenerate();
  }, [level]);

  const handleGenerate = async () => {
    setIsLoading(true);
    setEvaluation(null);
    setUserAnswer('');
    const q = await api.generatePractice(level);
    setQuestion(q);
    setIsLoading(false);
  };

  const handleEvaluate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userAnswer.trim() || !question || isEvaluating) return;

    setIsEvaluating(true);
    const res = await api.evaluatePractice(userAnswer, question);
    setEvaluation(res);
    setIsEvaluating(false);
  };

  const playSpeech = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ja-JP';
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div style={{ width: '100%', maxWidth: '880px', margin: '0 auto' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-grotesk)', fontSize: '1.6rem', fontWeight: 700, marginBottom: '4px' }}>
            ✍️ Luyện Dịch Câu (Active Production)
          </h2>
          <p style={{ color: 'var(--ink-secondary)', fontSize: '0.9rem' }}>
            AI tạo đề bài tiếng Việt kích thích phản xạ sử dụng từ vựng & ngữ pháp mục tiêu, kiểm tra IME tiếng Nhật.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            className="form-select"
            style={{ width: '110px', padding: '8px 12px' }}
          >
            <option value="N5">Cấp N5</option>
            <option value="N4">Cấp N4</option>
            <option value="N3">Cấp N3</option>
          </select>

          <button
            onClick={handleGenerate}
            disabled={isLoading}
            className="btn-tactile"
          >
            <RefreshCw size={15} className={isLoading ? 'animate-spin' : ''} />
            <span>{isLoading ? 'Đang tạo...' : 'Đổi Đề Bài'}</span>
          </button>
        </div>
      </div>

      {/* Main Practice Container */}
      {question && (
        <div className="card-tactile" style={{ padding: '36px', marginBottom: '24px' }}>
          {/* Vietnamese Sentence Prompt Card */}
          <div 
            style={{
              background: '#FFE8D6',
              border: 'var(--border-dark)',
              borderRadius: 'var(--radius-btn)',
              boxShadow: 'var(--shadow-sm)',
              padding: '24px',
              marginBottom: '24px'
            }}
          >
            <div style={{ fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--ink-secondary)', marginBottom: '6px' }}>
              Đề bài Tiếng Việt:
            </div>
            <div style={{ fontSize: '1.45rem', fontWeight: 700, color: '#0F172A', marginBottom: '14px' }}>
              "{question.sentenceVi}"
            </div>

            {/* Target Knowledge Tags */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--ink-secondary)' }}>
                Kiến thức mục tiêu:
              </span>
              {question.targetVocabulary.map((v, i) => (
                <span 
                  key={`v-${i}`}
                  className="meta-pill"
                  style={{ background: '#FFFFFF', color: '#0F172A', fontSize: '0.78rem' }}
                >
                  Từ vựng: {v}
                </span>
              ))}
              {question.targetGrammar.map((g, i) => (
                <span 
                  key={`g-${i}`}
                  className="meta-pill"
                  style={{ background: '#D8F3DC', color: '#133E2B', fontSize: '0.78rem' }}
                >
                  Ngữ pháp: {g}
                </span>
              ))}
            </div>
          </div>

          {/* Answer Input Section */}
          <form onSubmit={handleEvaluate}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--ink-primary)' }}>
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
                type="text"
                className="japanese-answer-input"
                placeholder="Ví dụ: 友達とこの映画を見たことがあります。"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                onCompositionStart={() => setIsComposing(true)}
                onCompositionEnd={() => setIsComposing(false)}
                disabled={isEvaluating}
                autoFocus
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                type="submit"
                disabled={isEvaluating || !userAnswer.trim()}
                className="btn-tactile primary lg"
                style={{ opacity: (!userAnswer.trim() || isEvaluating) ? 0.6 : 1 }}
              >
                <Send size={18} />
                <span>{isEvaluating ? 'AI Đang Chấm Điểm...' : 'Nộp Bài & Chấm Điểm AI'}</span>
              </button>
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
            padding: '28px'
          }}
        >
          {/* Score Banner */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {evaluation.correct ? (
                <CheckCircle2 size={32} color="var(--accent-pine)" />
              ) : (
                <AlertCircle size={32} color="var(--accent-vermilion)" />
              )}
              <div>
                <h3 style={{ fontFamily: 'var(--font-grotesk)', fontSize: '1.4rem', fontWeight: 700 }}>
                  {evaluation.correct ? 'Đạt Yêu Cầu Xuất Sắc!' : 'Cần Chỉnh Sửa Cho Đúng Cấu Trúc'}
                </h3>
                <span style={{ fontSize: '0.85rem', color: 'var(--ink-secondary)' }}>
                  Đánh giá chi tiết bởi trợ lý AI NihongoAI
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
              <span style={{ fontFamily: 'var(--font-grotesk)', fontSize: '2.4rem', fontWeight: 900, color: evaluation.correct ? 'var(--accent-pine)' : 'var(--accent-vermilion)' }}>
                {evaluation.score}
              </span>
              <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--ink-secondary)' }}>/ 100</span>
            </div>
          </div>

          {/* Sub-Scores Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px' }}>
            <div style={{ background: 'var(--bg-subtle)', border: 'var(--border-dark)', borderRadius: 'var(--radius-btn)', padding: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--ink-secondary)' }}>Ý NGHĨA SEMANTIC</div>
              <div style={{ fontFamily: 'var(--font-grotesk)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent-cobalt)' }}>
                {evaluation.meaningScore}%
              </div>
            </div>
            <div style={{ background: 'var(--bg-subtle)', border: 'var(--border-dark)', borderRadius: 'var(--radius-btn)', padding: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--ink-secondary)' }}>NGỮ PHÁP BIẾN ĐỔI</div>
              <div style={{ fontFamily: 'var(--font-grotesk)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent-pine)' }}>
                {evaluation.grammarScore}%
              </div>
            </div>
            <div style={{ background: 'var(--bg-subtle)', border: 'var(--border-dark)', borderRadius: 'var(--radius-btn)', padding: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--ink-secondary)' }}>ĐỘ TỰ NHIÊN BẢN XỨ</div>
              <div style={{ fontFamily: 'var(--font-grotesk)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent-amber)' }}>
                {evaluation.naturalnessScore}%
              </div>
            </div>
          </div>

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
              alignItems: 'center'
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
              className="btn-tactile sm"
              onClick={() => playSpeech(evaluation.suggestedAnswer)}
              title="Phát âm đáp án gợi ý"
            >
              <Volume2 size={16} />
            </button>
          </div>

          {/* Vietnamese Explanation */}
          <div style={{ fontSize: '0.95rem', color: 'var(--ink-primary)', lineHeight: '1.6', background: '#F8FAFC', border: 'var(--border-subtle)', padding: '14px 18px', borderRadius: 'var(--radius-btn)' }}>
            <strong style={{ color: 'var(--accent-cobalt)' }}>Giải thích chi tiết: </strong>
            {evaluation.explanationVi}
          </div>
        </div>
      )}
    </div>
  );
};
