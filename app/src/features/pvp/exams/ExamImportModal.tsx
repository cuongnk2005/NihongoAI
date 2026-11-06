import { useMemo, useRef, useState } from 'react';
import { X, Upload, Save } from 'lucide-react';
import { examErrors, parseQuizCsv, type ExamQuestion, type QuizExam } from './quizImport';

export function ExamImportModal({ onClose, onSave, initial }: {
  onClose: () => void; onSave: (exam: QuizExam) => Promise<void>; initial?: QuizExam;
}) {
  const [name, setName] = useState(initial?.name || '');
  const [questions, setQuestions] = useState<ExamQuestion[]>(initial?.questions || []);
  const [selected, setSelected] = useState(0); const [error, setError] = useState('');
  const [busy, setBusy] = useState(false); const [reading, setReading] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const problems = useMemo(() => examErrors(questions), [questions]);
  const invalid = problems.filter(errors => errors.length).length;
  const current = questions[selected];
  const firstInvalid = problems.findIndex(items => items.length > 0);
  const displayedProblem = problems[selected]?.length ? selected : firstInvalid;
  async function read(file?: File) {
    if (!file) return;
    setReading(true); setError('');
    try {
      if (!/\.(csv|tsv)$/i.test(file.name) || file.size > 2 * 1024 * 1024) throw new Error('Chọn file CSV/TSV UTF-8, tối đa 2 MB.');
      const parsed = parseQuizCsv(await file.text());
      setQuestions(parsed); setSelected(0); if (!name) setName(file.name.replace(/\.(csv|tsv)$/i, '').slice(0, 200));
    } catch (e) { setError(e instanceof Error ? e.message : 'Không đọc được file.'); }
    finally { setReading(false); }
  }
  function edit(patch: Partial<ExamQuestion>) { setQuestions(previous => previous.map((q, i) => i === selected ? { ...q, ...patch } : q)); }
  async function save() {
    setBusy(true); setError('');
    try {
      await onSave({ id: initial?.id || crypto.randomUUID(), name: name.trim(), questions,
        createdAt: initial?.createdAt || new Date().toISOString() });
      onClose();
    } catch (e) { setError(e instanceof Error ? e.message : 'Không lưu được bộ đề.'); }
    finally { setBusy(false); }
  }
  return <div className="modal-backdrop exam-backdrop"><section className="exam-modal" role="dialog" aria-modal="true" aria-labelledby="exam-import-title">
    <header><div><h2 id="exam-import-title">{initial ? 'Kiểm tra & sửa bộ đề' : 'Nhập bộ đề CSV'}</h2><p>Giữ nguyên câu hỏi, bốn lựa chọn và đáp án đúng từ file.</p></div><button className="btn-tactile sm" disabled={busy || reading} onClick={onClose} aria-label="Đóng"><X size={18} /></button></header>
    <div className="exam-import-tools"><label>Tên bộ đề<input className="form-input-text" value={name} maxLength={200} onChange={e => setName(e.target.value)} /></label><input ref={input} type="file" accept=".csv,.tsv" hidden onChange={e => { void read(e.target.files?.[0]); e.target.value = ''; }} /><button className="btn-tactile" disabled={busy || reading} onClick={() => input.current?.click()}><Upload size={16} />{reading ? 'Đang đọc…' : 'Chọn file CSV'}</button></div>
    {error && <p className="pvp-error" role="alert">{error}</p>}
    {questions.length > 0 ? <><div className="exam-import-summary" role="status">Đã đọc <strong>{questions.length} câu</strong> · {questions.length - invalid} câu hợp lệ · <strong>{invalid} câu cần sửa</strong>
      {displayedProblem >= 0 ? <div className="exam-save-blocker"><strong>Câu {questions[displayedProblem].number || displayedProblem + 1}:</strong> {problems[displayedProblem].join(' · ')} <button className="btn-tactile sm" onClick={() => setSelected(displayedProblem)}>Đến câu cần sửa</button></div> : <div className="exam-ready">✓ Các câu đã hợp lệ, bạn có thể lưu bộ đề.</div>}
    </div>
      <div className="exam-editor"><nav aria-label="Danh sách câu hỏi">{questions.map((q, i) => <button key={i} className={`${selected === i ? 'selected' : ''} ${problems[i].length ? 'has-error' : ''}`} onClick={() => setSelected(i)}><strong>Câu {q.number || i + 1}</strong><small>{q.section || 'Không phân nhóm'}{problems[i].length ? ' · Cần sửa' : ' · ✓'}</small></button>)}</nav>
        <div className="exam-question-editor"><div className="quiz-settings"><label>Số câu<input type="number" min={1} value={Number.isFinite(current.number) ? current.number : ''} onChange={e => edit({ number: Number(e.target.value) })} /></label><label>Nhóm câu hỏi<input value={current.section} maxLength={200} onChange={e => edit({ section: e.target.value })} /></label></div><label>Nội dung câu hỏi<textarea lang="ja" rows={3} value={current.question} onChange={e => edit({ question: e.target.value })} /></label>
          <fieldset><legend>Chọn đáp án đúng</legend>{current.options.map((option, i) => <label className={`exam-edit-option ${current.correct === i ? 'is-correct' : ''}`} key={i}><input type="radio" name="correct-answer" checked={current.correct === i} onChange={() => edit({ correct: i })} aria-label={`Đáp án đúng ${'ABCD'[i]}`} /><b>{'ABCD'[i]}</b><textarea lang="ja" rows={2} aria-label={`Lựa chọn ${'ABCD'[i]}`} value={option} onChange={e => edit({ options: current.options.map((old, index) => index === i ? e.target.value : old) })} /></label>)}</fieldset>
          {problems[selected].length > 0 && <ul className="exam-validation" role="alert">{problems[selected].map(problem => <li key={problem}>{problem}</li>)}</ul>}
        </div>
      </div></> : <div className="exam-empty"><Upload size={36} /><h3>Thêm đề thi của bạn</h3><p>Các cột: number, section, question, option_a, option_b, option_c, option_d, correct_answer.</p><p>Đáp án đúng dùng A/B/C/D. Hỗ trợ UTF-8, dấu phẩy trong ô có ngoặc kép và nội dung nhiều dòng. Tối đa 500 câu.</p></div>}
    <footer><small>{!name.trim() ? 'Nhập tên bộ đề để lưu.' : invalid > 0 ? `Chưa thể lưu: còn ${invalid} câu có lỗi. Sửa nội dung các lựa chọn bị trùng; chỉ đổi đáp án đúng hoặc câu hỏi sẽ không hết lỗi này.` : 'Bộ đề lưu riêng trên trình duyệt này. Chỉ gửi câu hỏi lên phòng khi host tạo trận.'}</small><button className="btn-tactile primary" disabled={busy || reading || !name.trim() || !questions.length || invalid > 0} onClick={() => void save()}><Save size={16} />{busy ? 'Đang lưu…' : 'Lưu bộ đề'}</button></footer>
  </section></div>;
}
