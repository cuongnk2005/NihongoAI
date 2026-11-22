import { useEffect, useState } from 'react';

const KEY = 'nihongoai-cultivation-v1';
const activities = ['review', 'practice', 'kaiwa'] as const;
type Activity = typeof activities[number];
type Progress = Record<Activity, number>;

function read(): Progress {
  const result: Progress = { review: 0, practice: 0, kaiwa: 0 };
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || '{}');
    for (const activity of activities) {
      if (Number.isFinite(saved[activity]) && saved[activity] >= 0) result[activity] = saved[activity];
    }
  } catch { /* Start fresh if storage is unavailable. */ }
  return result;
}

export function useCultivationTimer(tab: string) {
  useEffect(() => {
    if (!activities.includes(tab as Activity)) return;
    const activity = tab as Activity;
    let lastTick = Date.now();
    let lastInteraction = lastTick;
    let visible = document.visibilityState === 'visible';
    const save = () => {
      const now = Date.now();
      const elapsed = visible ? Math.max(0, Math.min(now, lastInteraction + 60_000) - lastTick) : 0;
      if (elapsed > 0) {
        try {
          const progress = read();
          progress[activity] += elapsed;
          localStorage.setItem(KEY, JSON.stringify(progress));
          window.dispatchEvent(new Event('cultivation-change'));
        } catch { /* Storage may be unavailable. */ }
      }
      lastTick = now;
    };
    const interact = () => { save(); lastInteraction = Date.now(); };
    const visibility = () => { save(); visible = document.visibilityState === 'visible'; lastInteraction = visible ? Date.now() : 0; };
    const events = ['pointerdown', 'keydown', 'touchstart', 'scroll'];
    events.forEach(event => window.addEventListener(event, interact, { passive: true }));
    document.addEventListener('visibilitychange', visibility);
    window.addEventListener('pagehide', save);
    const interval = window.setInterval(save, 5000);
    return () => {
      save();
      window.clearInterval(interval);
      events.forEach(event => window.removeEventListener(event, interact));
      document.removeEventListener('visibilitychange', visibility);
      window.removeEventListener('pagehide', save);
    };
  }, [tab]);
}

const realms = ['Phàm Nhân', 'Luyện Khí', 'Trúc Cơ', 'Kim Đan', 'Nguyên Anh', 'Hóa Thần', 'Luyện Hư', 'Hợp Thể', 'Đại Thừa', 'Độ Kiếp', 'Chân Tiên'];

export function CultivationCard() {
  const [progress, setProgress] = useState(read);
  useEffect(() => {
    const refresh = () => setProgress(read());
    window.addEventListener('cultivation-change', refresh);
    window.addEventListener('storage', refresh);
    return () => { window.removeEventListener('cultivation-change', refresh); window.removeEventListener('storage', refresh); };
  }, []);
  const xp = Math.floor(activities.reduce((sum, activity) => sum + progress[activity], 0) / 60_000);
  let level = 1;
  let remaining = xp;
  while (remaining >= level * 30 && level < 10000) { remaining -= level * 30; level++; }
  const needed = level * 30;
  const realm = realms[Math.min(Math.floor((level - 1) / 3), realms.length - 1)];
  const labels: Record<Activity, string> = { review: 'Học bộ thẻ', practice: 'Luyện viết câu', kaiwa: 'AI Kaiwa' };
  return <section className="card-tactile" style={{ padding: '24px', marginBottom: '24px' }} aria-label="Tiến trình tu tiên">
    <h3>✨ Hành trình tu tiên</h3>
    <p style={{ margin: '10px 0' }}><strong>{realm}</strong> · Cấp {level}</p>
    <div role="progressbar" aria-label="Kinh nghiệm đến cấp tiếp theo" aria-valuemin={0} aria-valuemax={needed} aria-valuenow={remaining} style={{ height: 12, background: 'var(--bg-stone)', borderRadius: 12, overflow: 'hidden' }}><div style={{ width: `${remaining / needed * 100}%`, height: '100%', background: 'var(--accent-pine)' }} /></div>
    <p style={{ marginTop: 8 }}>{remaining} / {needed} EXP đến cấp tiếp theo · Tổng {xp} EXP</p>
    <p style={{ marginTop: 8, color: 'var(--ink-secondary)', fontSize: '0.85rem' }}>{activities.map(a => `${labels[a]}: ${Math.floor(progress[a] / 60_000)} phút`).join(' · ')}</p>
    <p style={{ marginTop: 8, color: 'var(--ink-secondary)', fontSize: '0.85rem' }}>1 phút học tích cực = 1 EXP. Đồng hồ tạm dừng khi ẩn tab hoặc sau 1 phút không thao tác. Tiến trình lưu trên trình duyệt này.</p>
  </section>;
}
