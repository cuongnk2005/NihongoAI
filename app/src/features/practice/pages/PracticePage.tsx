import React, { useState, useEffect } from 'react';
import { api } from '../../../services/apiConfig';
import { PracticeQuestion, EvaluationResult } from '../../../types';
import { Sparkles, Send, RefreshCw, CheckCircle2, AlertCircle, Award } from 'lucide-react';

export const PracticePage: React.FC = () => {
  const [level, setLevel] = useState<string>('N4');
  const [question, setQuestion] = useState<PracticeQuestion | null>(null);
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);

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

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      width: '100%',
      maxWidth: '850px',
      margin: '0 auto'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Sparkles size={24} color="#6366f1" />
            <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#ffffff' }}>Luyện Dịch Việt $\rightarrow$ Nhật AI</h2>
          </div>
          <p style={{ fontSize: '13px', color: '#999999', marginTop: '4px' }}>
            AI tự động trích xuất từ vựng & ngữ pháp từ kho lưu trữ của bạn để tạo bài tập dịch tương thích level.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            style={{ padding: '8px 12px', background: '#1f1f1f', border: '1px solid #3b3c40', borderRadius: '8px', color: '#fff', fontSize: '13px' }}
          >
            <option value="N5">Cấp độ N5</option>
            <option value="N4">Cấp độ N4</option>
          </select>

          <button
            onClick={handleGenerate}
            disabled={isLoading}
            className="anki-btn"
            style={{ background: '#6366f1', color: '#fff', border: 'none', gap: '6px' }}
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
            {isLoading ? 'Đang tạo...' : 'Đề Bài Mới'}
          </button>
        </div>
      </div>

      {/* Main Practice Question Card */}
      {question && (
        <div style={{
          background: '#1f1f1f',
          borderRadius: '12px',
          border: '1px solid #333333',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
        }}>
          {/* Targets tags */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: '#888888', fontWeight: '600' }}>Từ vựng & Ngữ pháp mục tiêu:</span>
            {question.targetVocabulary.map((v, i) => (
              <span key={`v-${i}`} style={{ background: 'rgba(0, 153, 255, 0.15)', color: '#0099ff', border: '1px solid rgba(0, 153, 255, 0.3)', padding: '2px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: '600' }}>
                {v}
              </span>
            ))}
            {question.targetGrammar.map((g, i) => (
              <span key={`g-${i}`} style={{ background: 'rgba(46, 204, 113, 0.15)', color: '#2ecc71', border: '1px solid rgba(46, 204, 113, 0.3)', padding: '2px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: '600' }}>
                {g}
              </span>
            ))}
          </div>

          {/* Vietnamese Sentence Prompt */}
          <div style={{
            background: '#26272b',
            borderLeft: '4px solid #6366f1',
            borderRadius: '0 8px 8px 0',
            padding: '16px 20px'
          }}>
            <div style={{ fontSize: '12px', color: '#aaaaaa', marginBottom: '4px' }}>Đề bài Tiếng Việt:</div>
            <div style={{ fontSize: '18px', fontWeight: '700', color: '#ffffff' }}>
              "{question.sentenceVi}"
            </div>
          </div>

          {/* Answer Form */}
          <form onSubmit={handleEvaluate} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <label style={{ fontSize: '13px', color: '#cccccc', fontWeight: '500' }}>
              Nhập câu trả lời Tiếng Nhật của bạn:
            </label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                type="text"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="Ví dụ: 友達とこの映画を見たことがあります。"
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  background: '#282828',
                  border: '1px solid #3b3c40',
                  borderRadius: '8px',
                  color: '#ffffff',
                  fontSize: '16px',
                  fontFamily: "'Noto Sans JP', sans-serif"
                }}
                disabled={isEvaluating}
              />
              <button
                type="submit"
                disabled={isEvaluating || !userAnswer.trim()}
                className="anki-btn"
                style={{ background: '#6366f1', color: '#fff', border: 'none', padding: '0 20px' }}
              >
                <Send size={16} />
                {isEvaluating ? 'Đánh giá...' : 'Nộp Bài'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* AI Evaluation Result Card */}
      {evaluation && (
        <div style={{
          background: evaluation.correct ? 'rgba(46, 204, 113, 0.08)' : 'rgba(255, 77, 77, 0.08)',
          borderRadius: '12px',
          border: evaluation.correct ? '1px solid rgba(46, 204, 113, 0.3)' : '1px solid rgba(255, 77, 77, 0.3)',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          {/* Result Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {evaluation.correct ? (
                <CheckCircle2 size={24} color="#2ecc71" />
              ) : (
                <AlertCircle size={24} color="#ff4d4d" />
              )}
              <span style={{ fontSize: '18px', fontWeight: '700', color: evaluation.correct ? '#2ecc71' : '#ff4d4d' }}>
                {evaluation.correct ? 'Chính Xác! (Đạt Yêu Cầu)' : 'Cần Cải Thiện'}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#1f1f1f', padding: '6px 12px', borderRadius: '20px', border: '1px solid #333' }}>
              <Award size={16} color="#f59e0b" />
              <span style={{ fontSize: '14px', fontWeight: '700', color: '#ffffff' }}>
                {evaluation.score} / 100 điểm
              </span>
            </div>
          </div>

          {/* Detailed Scores Breakdown */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
            <div style={{ background: '#1f1f1f', padding: '10px 14px', borderRadius: '8px', border: '1px solid #333' }}>
              <div style={{ fontSize: '11px', color: '#888' }}>Ý nghĩa semantic</div>
              <div style={{ fontSize: '15px', fontWeight: '700', color: '#0099ff' }}>{evaluation.meaningScore}%</div>
            </div>
            <div style={{ background: '#1f1f1f', padding: '10px 14px', borderRadius: '8px', border: '1px solid #333' }}>
              <div style={{ fontSize: '11px', color: '#888' }}>Ngữ pháp</div>
              <div style={{ fontSize: '15px', fontWeight: '700', color: '#2ecc71' }}>{evaluation.grammarScore}%</div>
            </div>
            <div style={{ background: '#1f1f1f', padding: '10px 14px', borderRadius: '8px', border: '1px solid #333' }}>
              <div style={{ fontSize: '11px', color: '#888' }}>Độ tự nhiên</div>
              <div style={{ fontSize: '15px', fontWeight: '700', color: '#a855f7' }}>{evaluation.naturalnessScore}%</div>
            </div>
          </div>

          {/* Suggested Answer */}
          <div style={{ background: '#1f1f1f', padding: '14px 16px', borderRadius: '8px', border: '1px solid #333' }}>
            <div style={{ fontSize: '12px', color: '#aaaaaa', marginBottom: '4px' }}>Đáp án gợi ý tự nhiên từ AI:</div>
            <div style={{ fontSize: '16px', fontWeight: '700', color: '#2ecc71', fontFamily: "'Noto Sans JP', sans-serif" }}>
              {evaluation.suggestedAnswer}
            </div>
          </div>

          {/* Explanation in Vietnamese */}
          <div style={{ fontSize: '14px', color: '#dddddd', lineHeight: '1.6' }}>
            <span style={{ fontWeight: '700', color: '#ffffff' }}>Nhận xét chi tiết: </span>
            {evaluation.explanationVi}
          </div>
        </div>
      )}
    </div>
  );
};
