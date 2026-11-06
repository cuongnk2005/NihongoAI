import { useEffect, useMemo, useRef, useState } from 'react';
import { Swords, Trophy, Users, Zap, Copy, ArrowRight, Volume2, VolumeX } from 'lucide-react';
import { BASE_URL, request, Room, Session } from './api';
import './pvp.css';
import { AVATARS, avatarIcon, Leaderboard, rankedPlayers } from './Leaderboard';
import { AnswerActivity } from './AnswerActivity';
import { useAnswerSound } from './useAnswerSound';
import { initialDecks } from '../decks/pages/DecksPage';
import { useSavedDecks } from '../decks/useSavedDecks';
import { deckChoices } from './deckSource';
import { useExamLibrary } from './exams/useExamLibrary';
import { ExamImportModal } from './exams/ExamImportModal';
import { exportExamCsv, type QuizExam } from './exams/quizImport';
import { QuestionText } from './exams/QuestionText';

interface Saved { base: string; token: string; code: string }
function savedSession(): Saved | null {
  try { return JSON.parse(sessionStorage.getItem('pvp-session') || 'null'); } catch { return null; }
}
export function PvpPage() {
  const [session, setSession] = useState<Saved | null>(savedSession);
  const [base, setBase] = useState(session?.base || BASE_URL);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [count, setCount] = useState(10);
  const [mode, setMode] = useState<'DUEL' | 'QUIZ'>('QUIZ');
  const [avatar, setAvatar] = useState('fox');
  const [duration, setDuration] = useState(15);
  const { decks, loaded: decksLoaded, error: deckError, retry: retryDecks } = useSavedDecks(initialDecks);
  const sources = useMemo(() => deckChoices(decks), [decks]);
  const [sourceId, setSourceId] = useState('');
  const selectedSource = sources.find(source => source.id === sourceId) ?? sources[0];
  const library = useExamLibrary();
  const [sourceKind, setSourceKind] = useState<'DECK' | 'EXAM'>('DECK');
  const [examId, setExamId] = useState('');
  const [examSection, setExamSection] = useState('');
  const [examCount, setExamCount] = useState(0);
  const [shuffleExam, setShuffleExam] = useState(false);
  const [examEditor, setExamEditor] = useState<QuizExam | null | undefined>(undefined);
  const selectedExam = library.exams.find(exam => exam.id === examId) ?? library.exams[0];
  const examSections = [...new Set(selectedExam?.questions.map(q => q.section).filter(Boolean) || [])];
  const examQuestions = selectedExam?.questions.filter(q => !examSection || q.section === examSection) || [];
  const [room, setRoom] = useState<Room | null>(null);
  const { soundEnabled, toggleSound } = useAnswerSound(room);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [now, setNow] = useState(Date.now());
  const [selection, setSelection] = useState<{ key: string; choice: number; points: number } | null>(null);
  const offset = useRef(0);
  const playArea = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!session) return;
    window.scrollTo(0, 0);
    const fit = () => {
      const element = playArea.current;
      if (element) {
        const viewport = window.visualViewport;
        const bottom = viewport ? viewport.offsetTop + viewport.height : window.innerHeight;
        element.style.setProperty('--quiz-height', `${Math.max(280, bottom - element.getBoundingClientRect().top - 12)}px`);
      }
    };
    fit(); window.addEventListener('resize', fit);
    window.visualViewport?.addEventListener('resize', fit);
    const observer = new ResizeObserver(fit);
    const header = document.querySelector('.app-header');
    if (header) observer.observe(header);
    return () => { window.removeEventListener('resize', fit); window.visualViewport?.removeEventListener('resize', fit); observer.disconnect(); };
  }, [session]);
  const accept = (value: Room) => {
    offset.current = value.serverTime - Date.now();
    setRoom(previous => previous?.code === value.code && previous.serverTime > value.serverTime ? previous : value);
  };
  useEffect(() => {
    if (!session) return;
    let stopped = false;
    let timer: ReturnType<typeof setTimeout>;
    const poll = async () => {
      try {
        const value = await request<Room>(session.base, `/${session.code}`, session.token);
        if (!stopped) { accept(value); setError(''); }
      } catch (e) { if (!stopped) setError(e instanceof Error ? e.message : 'Mất kết nối. Đang thử lại…'); }
      if (!stopped) timer = setTimeout(poll, 500);
    };
    void poll();
    return () => { stopped = true; clearTimeout(timer); };
  }, [session]);
  useEffect(() => { const timer = setInterval(() => setNow(Date.now()), 100); return () => clearInterval(timer); }, []);
  async function enter(join: boolean) {
    setBusy(true); setError('');
    try {
      if (!join && sourceKind === 'DECK' && (!decksLoaded || !selectedSource)) throw new Error('Hãy tạo hoặc import một bộ thẻ trước khi tạo phòng.');
      if (!join && sourceKind === 'EXAM' && (!library.loaded || !selectedExam || !examQuestions.length)) throw new Error('Hãy nhập và chọn bộ đề có câu hỏi hợp lệ.');
      const source = !join && sourceKind === 'DECK' && selectedSource ? { name: selectedSource.label, cards: selectedSource.cards } : undefined;
      const exam = !join && sourceKind === 'EXAM' && selectedExam ? { name: `${selectedExam.name}${examSection ? ` / ${examSection}` : ''}`.slice(0, 200), questions: examQuestions, shuffle: shuffleExam } : undefined;
      const result = await request<Session>(base, join ? `/${encodeURIComponent(code.trim().toUpperCase())}/join` : '', undefined,
        { name, count: sourceKind === 'EXAM' ? examCount || examQuestions.length : count, mode, avatar, seconds: duration, source, exam });
      const saved = { base, token: result.token, code: result.room.code };
      sessionStorage.setItem('pvp-session', JSON.stringify(saved)); accept(result.room); setSession(saved);
    } catch (e) { setError(e instanceof Error ? e.message : 'Không kết nối được máy chủ.'); }
    finally { setBusy(false); }
  }
  async function action(path: string, body: unknown) {
    if (!session) return;
    setBusy(true); setError('');
    try { accept(await request<Room>(session.base, `/${session.code}/${path}`, session.token, body)); return true; }
    catch (e) { setError(e instanceof Error ? e.message : 'Không gửi được câu trả lời.'); return false; }
    finally { setBusy(false); }
  }
  const leave = () => { sessionStorage.removeItem('pvp-session'); setSession(null); setRoom(null); setError(''); };
  const seconds = room ? Math.max(0, (room.deadline - now - offset.current) / 1000) : 15;
  const revealed = room?.phase === 'REVEAL' || room?.phase === 'RANKING' || room?.phase === 'FINISHED';
  const me = room?.players[room.you];
  const finished = room?.phase === 'FINISHED';
  const questionInstruction = room?.question?.type === 'IMPORTED'
    ? `${room.question.section ? `${room.question.section} · ` : ''}Chọn đáp án đúng`
    : room?.question?.type === 'VIETNAMESE_TO_JAPANESE'
    ? 'Chọn từ tiếng Nhật tương ứng với nghĩa tiếng Việt'
    : room?.question?.type === 'KANJI_TO_HIRAGANA'
      ? 'Chọn cách đọc Hiragana của từ Kanji'
      : 'Chọn nghĩa tiếng Việt của từ tiếng Nhật';
  const isQuiz = room?.mode === 'QUIZ';
  const isHost = isQuiz && room?.you === 0;
  const participants = room ? rankedPlayers(room) : [];
  const answered = participants.filter(p => p.answered).length;
  const leaders = participants.filter(p => p.score === participants[0]?.score);
  const next = () => void action('next', { round: room?.round, phase: room?.phase });
  const nextIn = room ? Math.max(0, Math.ceil((room.nextAt - now - offset.current) / 1000)) : 0;
  const roundKey = room ? `${room.code}:${room.round}` : '';
  const currentSelection = selection?.key === roundKey ? selection : null;
  const selectedChoice = me?.choice ?? currentSelection?.choice;
  const speedPoints = room ? Math.min(1000, 500 + Math.floor(500 * seconds / room.seconds)) : 1000;
  const lockedPoints = room && me?.elapsedMs != null
    ? 500 + Math.floor(500 * Math.max(0, room.seconds * 1000 - me.elapsedMs) / (room.seconds * 1000))
    : currentSelection?.points ?? speedPoints;
  async function chooseAnswer(choice: number) {
    if (!room || busy || me?.answered) return;
    const key = roundKey;
    setSelection({ key, choice, points: speedPoints });
    const accepted = await action('answers', { round: room.round, choice });
    if (!accepted) setSelection(previous => previous?.key === key ? null : previous);
  }
  async function saveExam(exam: QuizExam) {
    await library.save(exam); setExamId(exam.id); setSourceKind('EXAM'); setExamSection(''); setExamCount(0);
  }
  function downloadExam() {
    if (!selectedExam) return;
    const url = URL.createObjectURL(new Blob([exportExamCsv(selectedExam)], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a'); link.href = url; link.download = `${selectedExam.name.replace(/[^\p{L}\p{N}_-]/gu, '_')}.csv`; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  const invalidSource = sourceKind === 'DECK'
    ? !decksLoaded || !selectedSource || selectedSource.cards.length < 5 || selectedSource.cards.length > 5000
    : !library.loaded || !selectedExam || !examQuestions.length;
  return <div ref={playArea} className={`pvp-page ${session ? 'quiz-in-game' : ''}`}>
    <div className="pvp-heading"><div><span className="pvp-eyebrow">NIHONGO ARENA · LIVE QUIZ</span><h1><Swords /> Đấu trường từ vựng</h1><p>Mời bạn bè, chọn linh vật và cùng đua lên đầu bảng.</p></div>{me ? <div className="quiz-my-score" aria-label="Tổng điểm của bạn"><span>{avatarIcon(me.avatar)}</span><div><small>Tổng điểm của bạn</small><strong>{me.score.toLocaleString()} <span>điểm</span></strong></div></div> : <span className="pvp-tag"><Zap size={16} /> Tối đa 1.000 điểm / câu</span>}</div>
    {error && <div className="pvp-error" role="alert">{error}</div>}
    {!session ? <>
      <div className="pvp-intro"><div className="pvp-kanji" lang="ja">勝負</div><div><span className="pvp-eyebrow">MỘT KHO TỪ · NHIỀU ĐỐI THỦ</span><h2>Biến giờ học thành<br />một cuộc đua.</h2><p>Chọn bộ thẻ để sinh câu hỏi Nhật–Việt, Việt–Nhật, Kanji–Hiragana; hoặc nhập bộ đề CSV có sẵn câu hỏi A–D. Đúng nhận 500 điểm và tối đa 500 điểm tốc độ. Sai hoặc hết giờ: 0 điểm.</p></div></div>
      <div className="pvp-connection"><label>Tên hiển thị<input maxLength={24} placeholder="Bạn tên là gì?" value={name} onChange={e => setName(e.target.value)} /></label><label>Địa chỉ API<input type="url" value={base} onChange={e => setBase(e.target.value)} /></label><small>Mọi người dùng cùng địa chỉ backend. Có thể thử bằng nhiều tab trình duyệt.</small></div>
      <fieldset className="quiz-avatar-picker"><legend>Chọn icon đại diện</legend>{AVATARS.map(([id, icon, label]) => <button type="button" key={id} aria-label={label} aria-pressed={avatar === id} className={avatar === id ? 'selected' : ''} onClick={() => setAvatar(id)}>{icon}</button>)}</fieldset>
      <div className="pvp-columns">
        <section className="pvp-card"><Users /><h2>Tạo phòng chơi</h2><div className="quiz-mode-picker"><button aria-pressed={mode === 'QUIZ'} className={mode === 'QUIZ' ? 'selected' : ''} onClick={() => setMode('QUIZ')}>Quiz nhiều người</button><button aria-pressed={mode === 'DUEL'} className={mode === 'DUEL' ? 'selected' : ''} onClick={() => setMode('DUEL')}>Đối kháng 1–1</button></div><p>{mode === 'QUIZ' ? 'Bạn vừa làm host vừa chơi, cùng tối đa 50 người tham gia khác. Tự chuyển câu; mở bảng xếp hạng khi bạn muốn.' : 'Hai người thi đấu, tự chuyển câu sau 3 giây công bố đáp án.'}</p>
          <label className="quiz-deck-source">Nguồn câu hỏi<select value={sourceKind} onChange={e => setSourceKind(e.target.value as 'DECK' | 'EXAM')}><option value="DECK">Bộ thẻ từ vựng</option><option value="EXAM">Bộ đề CSV đã nhập</option></select></label>
          <div className="quiz-settings"><label>Số câu{sourceKind === 'DECK' ? <select value={count} onChange={e => setCount(Number(e.target.value))}>{[5, 10, 15, 20].map(n => <option key={n} value={n}>{n} câu</option>)}</select> : <select value={examCount} onChange={e => setExamCount(Number(e.target.value))}><option value={0}>Toàn bộ ({examQuestions.length} câu)</option>{[5, 10, 20, 30, 50].map(n => <option key={n} value={n} disabled={n > examQuestions.length}>{n} câu</option>)}</select>}</label><label>Thời gian mỗi câu<select value={duration} onChange={e => setDuration(Number(e.target.value))}>{[15, 20, 30, 60].map(n => <option key={n} value={n}>{n} giây</option>)}</select></label></div>
          {sourceKind === 'DECK' ? <>
          <label className="quiz-deck-source">Bộ thẻ làm câu hỏi
            <select value={selectedSource?.id || ''} disabled={!decksLoaded || sources.length === 0} onChange={event => setSourceId(event.target.value)}>
              {!decksLoaded ? <option value="">Đang tải bộ thẻ…</option> : sources.length === 0 ? <option value="">Chưa có bộ thẻ</option> : sources.map(source => <option key={source.id} value={source.id}>{source.label} ({source.cards.length} từ)</option>)}
            </select>
          </label>
          {deckError && <p role="alert">{deckError} <button className="btn-tactile sm" onClick={retryDecks}>Thử lại</button></p>}
          <small>Gồm thẻ trong bộ con. Cần 5–5.000 từ có nghĩa Việt và ít nhất 4 đáp án khác nhau. Cách đọc Hiragana dùng cho dạng Kanji → Hiragana.</small>
          </> : <div className="exam-source-picker"><label>Bộ đề<select disabled={!library.loaded || !library.exams.length} value={selectedExam?.id || ''} onChange={e => { setExamId(e.target.value); setExamSection(''); setExamCount(0); }}>{!library.exams.length && <option value="">Chưa có bộ đề</option>}{library.exams.map(exam => <option key={exam.id} value={exam.id}>{exam.name} ({exam.questions.length} câu)</option>)}</select></label>
            <div className="exam-source-actions"><button className="btn-tactile sm" onClick={() => setExamEditor(null)}>Nhập CSV</button><button className="btn-tactile sm" disabled={!selectedExam} onClick={() => setExamEditor(selectedExam)}>Xem / sửa</button><button className="btn-tactile sm" disabled={!selectedExam} onClick={downloadExam}>Xuất CSV</button></div>
            {library.error && <p role="alert">{library.error} <button className="btn-tactile sm" onClick={library.retry}>Thử lại</button></p>}
            <label>Nhóm câu hỏi<select value={examSection} onChange={e => { setExamSection(e.target.value); setExamCount(0); }}><option value="">Tất cả các nhóm</option>{examSections.map(section => <option key={section} value={section}>{section}</option>)}</select></label>
            <label className="exam-shuffle"><input type="checkbox" checked={shuffleExam} onChange={e => setShuffleExam(e.target.checked)} />Xáo trộn câu hỏi</label><small>{shuffleExam ? 'Lấy ngẫu nhiên số câu đã chọn.' : 'Theo thứ tự trong file.'} Giữ nguyên thứ tự A–D và đáp án đã xác nhận.</small>
          </div>}
          <button className="btn-tactile primary" disabled={busy || !name.trim() || !base.trim() || invalidSource} onClick={() => void enter(false)}>Tạo phòng <ArrowRight size={16} /></button><small>Chỉ dữ liệu trong nguồn đã chọn được gửi lên phòng. Bộ gốc vẫn lưu trên trình duyệt của bạn.</small>
        </section>
        <section className="pvp-card"><Swords /><h2>Tham gia bằng mã phòng</h2><p>Chọn icon, nhập tên và mã 6 ký tự từ host. Chế độ được xác định theo phòng bạn vào.</p><label>Mã phòng<input className="pvp-code-input" maxLength={6} placeholder="A1B2C3" value={code} onChange={e => setCode(e.target.value.toUpperCase())} /></label><button className="btn-tactile" disabled={busy || !name.trim() || code.trim().length !== 6 || !base.trim()} onClick={() => void enter(true)}>{avatarIcon(avatar)} Vào phòng <ArrowRight size={16} /></button></section>
      </div>
    </> : !room ? <section className="pvp-card"><p>Đang kết nối lại phòng {session.code}…</p><button className="btn-tactile" onClick={leave}>Quay lại</button></section> : <>
      <div className="pvp-room-line"><button className="btn-tactile sm quiz-sound-toggle" onClick={toggleSound} aria-label={soundEnabled ? 'Tắt âm thanh trả lời' : 'Bật âm thanh trả lời'} aria-pressed={soundEnabled} title={soundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'}>{soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}</button><span>{isQuiz ? 'QUIZ' : '1 VS 1'} · PHÒNG <strong>{room.code}</strong></span><button className="btn-tactile sm" onClick={async () => { try { await navigator.clipboard.writeText(room.code); setCopied(true); } catch { setError(`Mã phòng: ${room.code}`); } }}><Copy size={14} />{copied ? 'Đã sao chép' : 'Sao chép mã'}</button><button className="btn-tactile sm" onClick={leave}>{finished ? 'Trận mới' : 'Rời màn hình'}</button></div>
      {isQuiz && <div className="quiz-host-badge">{avatarIcon(room.players[0].avatar)} Host: <strong>{room.players[0].name}</strong><span>{isHost ? 'Bạn vừa chơi vừa điều khiển phòng' : 'Host sẽ điều khiển chuyển câu'}</span></div>}
      {room.phase === 'WAITING' && <Leaderboard room={room} />}
      {room.phase === 'WAITING' ? <section className="pvp-card pvp-center"><Users size={40} /><h2>{isQuiz ? 'Sảnh chờ Quiz' : room.players.length === 2 ? 'Đối thủ đã sẵn sàng!' : 'Chờ người thứ hai vào phòng'}</h2><p>Chia sẻ mã <strong>{room.code}</strong> và địa chỉ API cho bạn bè.<br />{room.sourceName}<br />{room.total} câu · {room.seconds} giây / câu · {participants.length}{isQuiz ? '/51 người chơi (gồm host)' : '/2 người chơi'}</p>{room.you === 0 ? <button className="btn-tactile primary" disabled={busy || room.players.length < 2} onClick={() => void action('start', {})}>Bắt đầu {isQuiz ? 'Quiz' : 'trận đấu'}</button> : <p>Đã vào phòng! Đang chờ host bắt đầu…</p>}</section>
      : finished ? <><section className="pvp-card pvp-center"><Trophy size={52} /><span className="pvp-eyebrow">KẾT THÚC TRẬN ĐẤU</span><h2>{leaders.length > 1 ? `${leaders.length} người đồng hạng nhất!` : `${leaders[0]?.name} chiến thắng!`}</h2><p>Đã hoàn thành {room.total} câu. Cảm ơn mọi người đã tham gia!</p><button className="btn-tactile primary" onClick={leave}>Tạo trận mới</button></section><Leaderboard room={room} results /></>
      : room.phase === 'RANKING' ? <><Leaderboard room={room} results /><div className="quiz-host-controls"><p>Kết quả sau câu {room.round} / {room.total}</p>{isHost ? <button className="btn-tactile primary" disabled={busy} onClick={next}>{room.round === room.total ? 'Kết thúc & vinh danh' : 'Câu tiếp theo'} <ArrowRight size={16} /></button> : <p>Đang chờ host {room.round === room.total ? 'kết thúc trận' : 'chuyển câu'}…</p>}</div></>
      : <section className="pvp-card pvp-question"><div className="pvp-question-meta"><span>Câu {room.round} / {room.total}</span><strong>{revealed ? `+${me?.earned || 0} điểm` : `${me?.answered || currentSelection ? lockedPoints : seconds > 0 ? speedPoints : 0} điểm nếu đúng`}</strong></div><div className="pvp-timer"><div style={{ width: `${Math.min(100, seconds / room.seconds * 100)}%` }} /></div><p>{questionInstruction}</p><h2 className={room.question?.type === 'IMPORTED' ? 'exam-prompt' : ''} lang={room.question?.type === 'VIETNAMESE_TO_JAPANESE' ? 'vi' : 'ja'}><QuestionText text={room.question?.word || ''} /></h2>
        <div className="pvp-options">{room.question?.options.map((option, i) => <button lang={room.question?.type === 'JAPANESE_TO_VIETNAMESE' ? 'vi' : 'ja'} key={i} aria-pressed={selectedChoice === i} disabled={busy || revealed || !!me?.answered || seconds <= 0} className={`${!revealed && selectedChoice === i ? 'answer-selected' : ''} ${!revealed && selectedChoice !== undefined && selectedChoice !== i ? 'answer-dimmed' : ''} ${revealed && room.question?.correct === i ? 'correct' : ''} ${revealed && selectedChoice === i && room.question?.correct !== i ? 'wrong' : ''}`} onClick={() => void chooseAnswer(i)}><span>{'ABCD'[i]}</span><span className="quiz-option-text">{option}</span>{revealed && <small>{participants.filter(p => p.choice === i).length} chọn</small>}</button>)}</div>
        <div className="pvp-feedback" aria-live="polite">{revealed ? `Bạn nhận +${me?.earned || 0} điểm.${me?.elapsedMs != null ? ` Thời gian: ${(me.elapsedMs / 1000).toFixed(1)} giây.` : ' Bạn chưa trả lời.'}` : me?.answered ? 'Đã khóa đáp án. Đang chờ mọi người…' : 'Chọn thật chính xác, trả lời thật nhanh!'}</div>
        <div className="quiz-answer-progress"><span>{answered}/{participants.length} người đã trả lời</span><progress value={answered} max={Math.max(1, participants.length)} /></div>
        <AnswerActivity room={room} />
        <div className="quiz-host-controls">
          {revealed && <span className="pvp-feedback">Tự chuyển {room.round === room.total ? 'đến kết quả' : 'câu'} sau {nextIn} giây…</span>}
          {isHost && <button className="btn-tactile primary" disabled={busy} onClick={next}>{revealed ? 'Xem bảng xếp hạng' : 'Kết thúc câu & hiện đáp án'} <ArrowRight size={16} /></button>}
        </div>
      </section>}
    </>}
    {examEditor !== undefined && <ExamImportModal initial={examEditor || undefined} onClose={() => setExamEditor(undefined)} onSave={saveExam} />}
  </div>;
}
