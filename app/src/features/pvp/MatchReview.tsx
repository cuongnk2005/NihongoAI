import { useState } from 'react';
import { Check, RotateCcw, Save } from 'lucide-react';
import type { ReviewItem } from './api';
import { QuestionText } from './exams/QuestionText';
import type { QuizExam } from './exams/quizImport';

export function MatchReview({ items, sourceName, onSave }: {
  items: ReviewItem[]; sourceName: string; onSave: (exam: QuizExam) => Promise<void>;
}) {
  const wrong = items.filter(item => item.choice !== item.correct);
  const missed = wrong.filter(item => item.choice === null).length;
  const [practice, setPractice] = useState(false); const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [saving, setSaving] = useState(false); const [saved, setSaved] = useState(false); const [error, setError] = useState('');
  const question = wrong[index];
  const answered = question ? answers[question.round] : undefined;
  const correctCount = wrong.filter(q => answers[q.round] === q.correct).length;
  async function save() {
    setSaving(true); setError('');
    try {
      await onSave({ id: crypto.randomUUID(), name: `Ôn câu sai - ${sourceName}`.slice(0, 200), createdAt: new Date().toISOString(),
        questions: wrong.map(q => ({ number: q.round, section: q.section, question: q.question, options: q.options, correct: q.correct })) });
      setSaved(true);
    } catch (e) { setError(e instanceof Error ? e.message : 'Không lưu được bộ ôn tập.'); }
    finally { setSaving(false); }
  }
  function restart() { setPractice(true); setIndex(0); setAnswers({}); }
  return <section className="pvp-card match-review" aria-label="Xem lại câu sai">
    <header><div><h2>Xem lại & ôn câu sai</h2><p>{items.length - wrong.length}/{items.length} câu đúng · {wrong.length - missed} câu sai · {missed} câu chưa trả lời</p></div>
      {wrong.length > 0 && <div className="match-review-actions"><button className="btn-tactile sm" onClick={restart}><RotateCcw size={14} />Làm lại câu sai</button><button className="btn-tactile sm" disabled={saving || saved} onClick={() => void save()}><Save size={14} />{saved ? 'Đã lưu để ôn sau' : saving ? 'Đang lưu…' : 'Lưu bộ ôn tập'}</button></div>}
    </header>
    {error && <p role="alert" className="pvp-error">{error}</p>}
    {saved && <p className="match-review-saved" role="status">Đã lưu trên trình duyệt này. Tìm bộ ôn tập trong “Bộ đề CSV đã nhập” khi tạo phòng.</p>}
    {wrong.length === 0 ? <div className="match-review-empty"><Check size={36} /><h3>Bạn đã đúng tất cả các câu!</h3><p>Không có câu sai để ôn lại.</p></div>
    : practice ? <div className="match-review-scroll"><div className="match-review-practice-head"><span>Ôn {index + 1}/{wrong.length} · Câu {question.round} trong trận</span><button className="btn-tactile sm" onClick={() => setPractice(false)}>Xem danh sách</button></div>
      <h3 className="review-question"><QuestionText text={question.question} /></h3>
      <div className="review-options">{question.options.map((option, i) => <button key={i} disabled={answered !== undefined}
        className={`${answered !== undefined && i === question.correct ? 'is-correct' : ''} ${answered === i && i !== question.correct ? 'is-wrong' : ''}`}
        onClick={() => setAnswers(previous => ({ ...previous, [question.round]: i }))}><b>{'ABCD'[i]}</b><span>{option}</span></button>)}</div>
      {answered !== undefined && <p className="review-practice-feedback" role="status">{answered === question.correct ? 'Chính xác!' : `Chưa đúng. Đáp án: ${'ABCD'[question.correct]} — ${question.options[question.correct]}`}</p>}
      <div className="match-review-actions">{index < wrong.length - 1 ? <button className="btn-tactile primary" disabled={answered === undefined} onClick={() => setIndex(n => n + 1)}>Câu tiếp theo</button> : answered !== undefined && <><p>Đã ôn xong: đúng {correctCount}/{wrong.length} câu. Lượt ôn không thay đổi điểm trận đấu.</p><button className="btn-tactile" onClick={restart}>Ôn lại lần nữa</button></>}</div>
    </div>
    : <div className="match-review-scroll">{wrong.map(q => <article className="review-item" key={q.round}><div className="review-item-heading"><b>Câu {q.round}</b><small>{q.section} · {q.choice === null ? 'Chưa trả lời' : 'Trả lời sai'}</small></div><h3 className="review-question"><QuestionText text={q.question} /></h3>
      <div className="review-options">{q.options.map((option, i) => <div key={i} className={`${i === q.correct ? 'is-correct' : ''} ${q.choice === i && i !== q.correct ? 'is-wrong' : ''}`}><b>{'ABCD'[i]}</b><span>{option}</span><small>{i === q.correct ? '✓ Đáp án đúng' : q.choice === i ? 'Bạn đã chọn' : ''}</small></div>)}</div>
    </article>)}</div>}
  </section>;
}
