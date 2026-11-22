import React, { useEffect, useState } from 'react';
import { CultivationCard } from '../../cultivation/Cultivation';
import { TrendingUp, Calendar, Award, CheckCircle2, Clock } from 'lucide-react';
import { getStatistics, StudyStatistics } from '../api';

const groups = [
  { key: 'EASY', label: 'Easy (Dễ)', color: 'var(--accent-cobalt)' },
  { key: 'GOOD', label: 'Good (Tốt)', color: 'var(--accent-pine)' },
  { key: 'HARD', label: 'Hard (Khó)', color: 'var(--accent-amber)' },
  { key: 'AGAIN', label: 'Again (Học lại)', color: 'var(--accent-vermilion)' }
];
const dateLabel = (date: string) => new Date(`${date}T12:00:00`).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
export const StatisticsPage: React.FC = () => {
  const [data, setData] = useState<StudyStatistics | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true); setError('');
      try { const result = await getStatistics(); if (active) setData(result); }
      catch { if (active) setError('Không tải được thống kê. Kiểm tra backend và thử lại.'); }
      finally { if (active) setLoading(false); }
    };
    void load();
    const refresh = () => { if (document.visibilityState === 'visible') void load(); };
    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', refresh);
    return () => { active = false; window.removeEventListener('focus', refresh); document.removeEventListener('visibilitychange', refresh); };
  }, [revision]);
  const metrics = data ? [
    { label: 'HÔM NAY', value: data.todayReviews, unit: 'lượt ôn', icon: CheckCircle2, color: 'var(--accent-pine)' },
    { label: 'TỶ LỆ NHỚ', value: data.retentionPercent === null ? '—' : `${data.retentionPercent.toFixed(1)}%`, unit: '', icon: TrendingUp, color: 'var(--accent-cobalt)' },
    { label: 'CHUỖI NGÀY HỌC', value: data.streakDays, unit: 'ngày', icon: Award, color: 'var(--accent-amber)' },
    { label: 'THỜI GIAN TRUNG BÌNH', value: data.averageSeconds === null ? '—' : `${data.averageSeconds.toFixed(1)}s`, unit: '/lượt', icon: Clock, color: 'var(--accent-vermilion)' }
  ] : [];
  return <div style={{ width: '100%', maxWidth: '880px', margin: '0 auto' }} aria-busy={loading}>
    <div style={{ marginBottom: '20px' }}>
      <h2 style={{ fontFamily: 'var(--font-grotesk)', fontSize: '1.6rem', fontWeight: 700 }}>📊 Thống Kê & Phân Tích Tiến Độ Học Tập</h2>
      <p style={{ color: 'var(--ink-secondary)', marginTop: '8px' }}>Lịch sử ôn bộ thẻ và ngữ pháp được lưu trên máy của bạn.</p>
      <button className="btn-tactile sm" disabled={loading} onClick={() => setRevision(n => n + 1)} style={{ marginTop: '12px' }}>{loading ? 'Đang tải…' : 'Làm mới'}</button>
    </div>
    <CultivationCard />
    {error && <p role="alert" style={{ color: 'var(--accent-vermilion)', marginBottom: '16px' }}>{error}</p>}
    {!data && loading && <p role="status">Đang tải lịch sử học tập…</p>}
    {data && <>
      {data.totalReviews === 0 && <p style={{ marginBottom: '16px' }}>Chưa có lượt ôn trong 28 ngày qua. Hoàn thành một lượt ôn để bắt đầu theo dõi tiến độ.</p>}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '24px' }}>
        {metrics.map(({ label, value, unit, icon: Icon, color }) => <div key={label} className="card-tactile" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', marginBottom: '8px' }}><span style={{ fontSize: '0.78rem', fontWeight: 700 }}>{label}</span><Icon size={16} color={color} /></div>
          <div style={{ fontFamily: 'var(--font-grotesk)', fontSize: '1.8rem', fontWeight: 900 }}>{value} <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>{unit}</span></div>
        </div>)}
      </div>
      <p style={{ color: 'var(--ink-secondary)', fontSize: '0.85rem', marginBottom: '20px' }}>Tỷ lệ nhớ = Hard, Good và Easy / tổng lượt ôn trong 28 ngày. Thời gian tính từ lúc hiện thẻ đến khi đánh giá, trên {data.timedReviews} lượt có đo thời gian. Chuỗi ngày học được giữ nếu bạn đã học hôm qua.</p>
      <div className="card-tactile" style={{ padding: '24px', marginBottom: '24px' }}>
        <h3 style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '16px' }}><Calendar size={18} /> Tần Suất Ôn Luyện (28 Ngày Gần Nhất)</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: '8px' }}>
          {data.days.map(day => <div key={day.date} title={`${dateLabel(day.date)}: ${day.count} lượt ôn`} style={{ background: day.count > 30 ? 'var(--accent-pine)' : day.count > 15 ? '#BBF7D0' : day.count > 0 ? '#E2E8F0' : 'var(--bg-stone)', color: day.count > 30 ? '#fff' : day.count > 0 ? '#0F172A' : 'var(--ink-primary)', border: 'var(--border-dark)', borderRadius: 'var(--radius-btn)', padding: '8px 0', textAlign: 'center', fontSize: '0.8rem' }}>
            <div style={{ opacity: 0.7, fontSize: '0.7rem' }}>{dateLabel(day.date)}</div><strong>{day.count}</strong>
          </div>)}
        </div>
        <p style={{ fontSize: '0.8rem', marginTop: '14px', color: 'var(--ink-secondary)' }}>Tổng: {data.totalReviews} lượt ôn · Một thẻ có thể được ôn nhiều lần trong ngày.</p>
      </div>
      <div className="card-tactile" style={{ padding: '24px' }}>
        <h3 style={{ marginBottom: '16px' }}>Phân Bố Đánh Giá (28 Ngày)</h3>
        {groups.map(group => {
          const count = data.ratings[group.key] || 0;
          const percent = data.totalReviews ? count * 100 / data.totalReviews : 0;
          return <div key={group.key} style={{ marginBottom: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}><span>{group.label}</span><span>{count} lượt · {percent.toFixed(1)}%</span></div>
            <div role="progressbar" aria-label={group.label} aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100} style={{ background: 'var(--bg-stone)', height: '12px', borderRadius: 'var(--radius-pill)', overflow: 'hidden' }}><div style={{ width: `${percent}%`, background: group.color, height: '100%' }} /></div>
          </div>;
        })}
      </div>
    </>}
  </div>;
};
