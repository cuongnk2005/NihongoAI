import React from 'react';
import { TrendingUp, Calendar, Award, CheckCircle2, Clock } from 'lucide-react';

export const StatisticsPage: React.FC = () => {
  const heatmapDays = Array.from({ length: 28 }, (_, i) => {
    const count = Math.floor(Math.random() * 45);
    return { day: i + 1, count };
  });

  return (
    <div style={{ width: '100%', maxWidth: '880px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ fontFamily: 'var(--font-grotesk)', fontSize: '1.6rem', fontWeight: 700, marginBottom: '4px' }}>
          📊 Thống Kê & Phân Tích Tiến Độ Học Tập
        </h2>
        <p style={{ color: 'var(--ink-secondary)', fontSize: '0.9rem' }}>
          Đo lường hiệu quả thuật toán FSRS, tỷ lệ duy trì trí nhớ và tần suất ôn luyện hàng ngày.
        </p>
      </div>

      {/* Top 4 Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '24px' }}>
        <div className="card-tactile" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--ink-secondary)' }}>HÔM NAY</span>
            <CheckCircle2 size={16} color="var(--accent-pine)" />
          </div>
          <div style={{ fontFamily: 'var(--font-grotesk)', fontSize: '1.8rem', fontWeight: 900 }}>
            42 <span style={{ fontSize: '0.9rem', color: 'var(--ink-secondary)', fontWeight: 600 }}>thẻ</span>
          </div>
        </div>

        <div className="card-tactile" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--ink-secondary)' }}>TỶ LỆ NHỚ</span>
            <TrendingUp size={16} color="var(--accent-cobalt)" />
          </div>
          <div style={{ fontFamily: 'var(--font-grotesk)', fontSize: '1.8rem', fontWeight: 900, color: 'var(--accent-cobalt)' }}>
            92.4%
          </div>
        </div>

        <div className="card-tactile" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--ink-secondary)' }}>STREAK</span>
            <Award size={16} color="var(--accent-amber)" />
          </div>
          <div style={{ fontFamily: 'var(--font-grotesk)', fontSize: '1.8rem', fontWeight: 900, color: 'var(--accent-amber)' }}>
            14 <span style={{ fontSize: '0.9rem', color: 'var(--ink-secondary)', fontWeight: 600 }}>ngày</span>
          </div>
        </div>

        <div className="card-tactile" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--ink-secondary)' }}>TỐC ĐỘ</span>
            <Clock size={16} color="var(--accent-vermilion)" />
          </div>
          <div style={{ fontFamily: 'var(--font-grotesk)', fontSize: '1.8rem', fontWeight: 900 }}>
            6.8s <span style={{ fontSize: '0.9rem', color: 'var(--ink-secondary)', fontWeight: 600 }}>/thẻ</span>
          </div>
        </div>
      </div>

      {/* Study Activity Heatmap */}
      <div className="card-tactile" style={{ marginBottom: '24px', padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <Calendar size={18} color="var(--accent-pine)" />
          <h3 style={{ fontFamily: 'var(--font-grotesk)', fontSize: '1.1rem', fontWeight: 700 }}>
            Biểu Đồ Tần Suất Ôn Luyện (4 Tuần Gần Nhất)
          </h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '10px' }}>
          {heatmapDays.map((item) => {
            let bg = 'var(--bg-stone)';
            let textColor = 'var(--ink-primary)';
            if (item.count > 30) { bg = 'var(--accent-pine)'; textColor = '#FFFFFF'; }
            else if (item.count > 15) { bg = '#BBF7D0'; textColor = '#0F172A'; }
            else if (item.count > 0) { bg = '#E2E8F0'; textColor = '#0F172A'; }

            return (
              <div
                key={item.day}
                title={`Ngày ${item.day}: ${item.count} thẻ ôn tập`}
                style={{
                  background: bg,
                  border: 'var(--border-dark)',
                  boxShadow: 'var(--shadow-sm)',
                  borderRadius: 'var(--radius-btn)',
                  height: '46px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: textColor,
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  transition: 'transform 0.1s ease',
                  cursor: 'pointer'
                }}
              >
                <span style={{ opacity: 0.65, fontSize: '0.68rem' }}>N.{item.day}</span>
                <span>{item.count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* FSRS Retention Distribution */}
      <div className="card-tactile" style={{ padding: '24px' }}>
        <h3 style={{ fontFamily: 'var(--font-grotesk)', fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px' }}>
          Phân Nhóm Đánh Giá Theo Chu Kỳ FSRS
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
              <span>Easy (Dễ)</span>
              <span style={{ color: 'var(--accent-cobalt)' }}>58%</span>
            </div>
            <div style={{ background: 'var(--bg-stone)', border: 'var(--border-dark)', height: '12px', borderRadius: 'var(--radius-pill)', overflow: 'hidden' }}>
              <div style={{ width: '58%', background: 'var(--accent-cobalt)', height: '100%' }} />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
              <span>Good (Tốt)</span>
              <span style={{ color: 'var(--accent-pine)' }}>28%</span>
            </div>
            <div style={{ background: 'var(--bg-stone)', border: 'var(--border-dark)', height: '12px', borderRadius: 'var(--radius-pill)', overflow: 'hidden' }}>
              <div style={{ width: '28%', background: 'var(--accent-pine)', height: '100%' }} />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
              <span>Hard (Khó)</span>
              <span style={{ color: 'var(--accent-amber)' }}>10%</span>
            </div>
            <div style={{ background: 'var(--bg-stone)', border: 'var(--border-dark)', height: '12px', borderRadius: 'var(--radius-pill)', overflow: 'hidden' }}>
              <div style={{ width: '10%', background: 'var(--accent-amber)', height: '100%' }} />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
              <span>Again (Học Lại)</span>
              <span style={{ color: 'var(--accent-vermilion)' }}>4%</span>
            </div>
            <div style={{ background: 'var(--bg-stone)', border: 'var(--border-dark)', height: '12px', borderRadius: 'var(--radius-pill)', overflow: 'hidden' }}>
              <div style={{ width: '4%', background: 'var(--accent-vermilion)', height: '100%' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
