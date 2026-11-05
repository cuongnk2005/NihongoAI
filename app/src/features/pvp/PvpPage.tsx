import { useEffect, useRef, useState } from 'react';
import { Swords, Trophy, Users, Zap, Copy, ArrowRight } from 'lucide-react';
import { BASE_URL, request, Room, Session } from './api';
import './pvp.css';

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
  const [room, setRoom] = useState<Room | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [now, setNow] = useState(Date.now());
  const offset = useRef(0);
  const accept = (value: Room) => { offset.current = value.serverTime - Date.now(); setRoom(value); };
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
      const result = await request<Session>(base, join ? `/${encodeURIComponent(code.trim().toUpperCase())}/join` : '', undefined, { name, count });
      const saved = { base, token: result.token, code: result.room.code };
      sessionStorage.setItem('pvp-session', JSON.stringify(saved)); accept(result.room); setSession(saved);
    } catch (e) { setError(e instanceof Error ? e.message : 'Không kết nối được máy chủ.'); }
    finally { setBusy(false); }
  }
  async function action(path: string, body: unknown) {
    if (!session) return;
    setBusy(true); setError('');
    try { accept(await request<Room>(session.base, `/${session.code}/${path}`, session.token, body)); }
    catch (e) { setError(e instanceof Error ? e.message : 'Không gửi được câu trả lời.'); }
    finally { setBusy(false); }
  }
  const leave = () => { sessionStorage.removeItem('pvp-session'); setSession(null); setRoom(null); setError(''); };
  const seconds = room ? Math.max(0, (room.deadline - now - offset.current) / 1000) : 15;
  const revealed = room?.phase === 'REVEAL' || room?.phase === 'FINISHED';
  const me = room?.players[room.you];
  const finished = room?.phase === 'FINISHED';
  const questionInstruction = room?.question?.type === 'VIETNAMESE_TO_JAPANESE'
    ? 'Chọn từ tiếng Nhật tương ứng với nghĩa tiếng Việt'
    : room?.question?.type === 'KANJI_TO_HIRAGANA'
      ? 'Chọn cách đọc Hiragana của từ Kanji'
      : 'Chọn nghĩa tiếng Việt của từ tiếng Nhật';
  return <div className="pvp-page">
    <div className="pvp-heading"><div><span className="pvp-eyebrow">NIHONGO ARENA · 1 VS 1</span><h1><Swords /> Đấu trường từ vựng</h1><p>Cùng một câu hỏi. Đúng và nhanh hơn để dẫn đầu.</p></div><span className="pvp-tag"><Zap size={16} /> Tối đa 1.000 điểm / câu</span></div>
    {error && <div className="pvp-error" role="alert">{error}</div>}
    {!session ? <>
      <div className="pvp-intro"><div className="pvp-kanji" lang="ja">勝負</div><div><span className="pvp-eyebrow">THÁCH ĐẤU BẠN BÈ</span><h2>Kho từ của bạn.<br />Trận đấu của cả hai.</h2><p>Ngẫu nhiên 3 dạng: Nhật → Việt, Việt → Nhật, Kanji → Hiragana. Mỗi câu có 15 giây và 4 lựa chọn. Trả lời đúng nhận 500 điểm, cộng tối đa 500 điểm tốc độ. Trả lời sai hoặc hết giờ: 0 điểm.</p></div></div>
      <div className="pvp-connection"><label>Tên người chơi<input maxLength={24} placeholder="Bạn tên là gì?" value={name} onChange={e => setName(e.target.value)} /></label><label>Địa chỉ API của chủ phòng<input type="url" value={base} onChange={e => setBase(e.target.value)} /></label><small>Cả hai dùng cùng địa chỉ máy chủ. Thử ngay trên máy này bằng hai tab trình duyệt.</small></div>
      <div className="pvp-columns"><section className="pvp-card"><Users /><h2>Tạo phòng mới</h2><p>Câu hỏi được lấy ngẫu nhiên từ kho từ vựng trên máy chủ bạn chọn.</p><label>Số câu hỏi<select value={count} onChange={e => setCount(Number(e.target.value))}>{[5, 10, 15, 20].map(n => <option key={n} value={n}>{n} câu</option>)}</select></label><button className="btn-tactile primary" disabled={busy || !name.trim() || !base.trim()} onClick={() => void enter(false)}>Tạo phòng <ArrowRight size={16} /></button><small>Cần ít nhất 5 từ với 4 nghĩa khác nhau. Nếu kho ít từ, trận đấu dùng số từ hiện có.</small></section>
      <section className="pvp-card"><Swords /><h2>Nhận lời thách đấu</h2><p>Nhập mã 6 ký tự được chủ phòng chia sẻ để tham gia.</p><label>Mã phòng<input className="pvp-code-input" maxLength={6} placeholder="A1B2C3" value={code} onChange={e => setCode(e.target.value.toUpperCase())} /></label><button className="btn-tactile" disabled={busy || !name.trim() || code.trim().length !== 6} onClick={() => void enter(true)}>Vào phòng <ArrowRight size={16} /></button></section></div>
    </> : !room ? <section className="pvp-card"><p>Đang kết nối lại phòng {session.code}…</p><button className="btn-tactile" onClick={leave}>Quay lại</button></section> : <>
      <div className="pvp-room-line"><span>PHÒNG <strong>{room.code}</strong></span><button className="btn-tactile sm" onClick={async () => { try { await navigator.clipboard.writeText(room.code); setCopied(true); } catch { setError(`Mã phòng: ${room.code}`); } }}><Copy size={14} />{copied ? 'Đã sao chép' : 'Sao chép mã'}</button><button className="btn-tactile sm" onClick={leave}>{finished ? 'Trận mới' : 'Rời màn hình'}</button></div>
      <div className="pvp-scoreboard">{[0, 1].map(i => <div className={`pvp-player ${i === room.you ? 'is-me' : ''}`} key={i}><span>{room.players[i]?.name || 'Đang chờ đối thủ…'} {i === room.you && '· Bạn'}</span><strong>{room.players[i]?.score.toLocaleString() || 0}</strong><small>{revealed ? `+${room.players[i]?.earned || 0} điểm` : room.players[i]?.answered ? 'Đã khóa đáp án' : i === 0 ? 'Chủ phòng' : 'Người thách đấu'}</small></div>)}</div>
      {room.phase === 'WAITING' ? <section className="pvp-card pvp-center"><Users size={40} /><h2>{room.players.length === 2 ? 'Đối thủ đã sẵn sàng!' : 'Chờ người thứ hai vào phòng'}</h2><p>Chia sẻ mã <strong>{room.code}</strong> và địa chỉ API cho bạn bè.<br />{room.total} câu · 15 giây / câu · Kho từ của chủ phòng</p>{room.you === 0 ? <button className="btn-tactile primary" disabled={busy || room.players.length !== 2} onClick={() => void action('start', {})}>Bắt đầu trận đấu</button> : <p>Đang chờ chủ phòng bắt đầu…</p>}</section>
      : finished ? <section className="pvp-card pvp-center"><Trophy size={52} /><span className="pvp-eyebrow">KẾT THÚC TRẬN ĐẤU</span><h2>{room.players[0].score === room.players[1].score ? 'Bất phân thắng bại!' : `${room.players[room.players[0].score > room.players[1].score ? 0 : 1].name} chiến thắng!`}</h2><p>Đã hoàn thành {room.total} câu. Tiếp tục luyện tập để bứt tốc ở trận sau.</p><button className="btn-tactile primary" onClick={leave}>Tạo trận mới</button></section>
      : <section className="pvp-card pvp-question"><div className="pvp-question-meta"><span>Câu {room.round} / {room.total}</span><strong>{revealed ? 'Đáp án' : `${seconds.toFixed(1)} giây`}</strong></div><div className="pvp-timer"><div style={{ width: `${seconds / 15 * 100}%` }} /></div><p>{questionInstruction}</p><h2 lang={room.question?.type === 'VIETNAMESE_TO_JAPANESE' ? 'vi' : 'ja'}>{room.question?.word}</h2><div className="pvp-options">{room.question?.options.map((option, i) => <button lang={room.question?.type === 'JAPANESE_TO_VIETNAMESE' ? 'vi' : 'ja'} key={i} disabled={busy || revealed || !!me?.answered || seconds <= 0} className={`${revealed && room.question?.correct === i ? 'correct' : ''} ${revealed && me?.choice === i && room.question?.correct !== i ? 'wrong' : ''}`} onClick={() => void action('answers', { round: room.round, choice: i })}><span>{'ABCD'[i]}</span>{option}</button>)}</div><div className="pvp-feedback" aria-live="polite">{revealed ? `Bạn nhận +${me?.earned || 0} điểm. Câu tiếp theo sau 3 giây…` : me?.answered ? 'Đã nhận câu trả lời. Đang chờ đối thủ…' : 'Chọn thật chính xác, trả lời thật nhanh!'}</div></section>}
    </>}
  </div>;
}
