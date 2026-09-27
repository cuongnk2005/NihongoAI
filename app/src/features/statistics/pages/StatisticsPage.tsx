import React from 'react';
import { BarChart3, TrendingUp, Calendar, Award, CheckCircle2, Clock } from 'lucide-react';

export const StatisticsPage: React.FC = () => {
  // Generate dummy 30-day heatmap grid data
  const heatmapDays = Array.from({ length: 28 }, (_, i) => {
    const count = Math.floor(Math.random() * 45);
    return { day: i + 1, count };
  });

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
      width: '100%',
      maxWidth: '850px',
      margin: '0 auto'
    }}>
      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <BarChart3 size={24} color="var(--anki-blue)" />
          <h2 style={{ fontSize: '22px', fontWeight: '700', color: 'var(--anki-text)' }}>Thống Kê Tiến Độ Học Tập</h2>
        </div>
        <p style={{ fontSize: '13px', color: 'var(--anki-text-muted)', marginTop: '4px' }}>
          Tổng hợp thông số ôn luyện FSRS, tỉ lệ ghi nhớ từ vựng và chuỗi ngày học tập (Streak).
        </p>
      </div>

      {/* Top 4 Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>
        <div style={{ background: 'var(--anki-panel-bg)', padding: '16px', borderRadius: '10px', border: '1px solid var(--anki-border)', boxShadow: 'var(--anki-shadow)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', color: 'var(--anki-text-muted)' }}>Thẻ Ôn Hôm Nay</span>
            <CheckCircle2 size={16} color="var(--anki-green)" />
          </div>
          <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--anki-text)' }}>42 <span style={{ fontSize: '13px', color: 'var(--anki-text-muted)', fontWeight: 'normal' }}>thẻ</span></div>
        </div>

        <div style={{ background: 'var(--anki-panel-bg)', padding: '16px', borderRadius: '10px', border: '1px solid var(--anki-border)', boxShadow: 'var(--anki-shadow)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', color: 'var(--anki-text-muted)' }}>Tỉ Lệ Ghi Nhớ</span>
            <TrendingUp size={16} color="var(--anki-blue)" />
          </div>
          <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--anki-blue)' }}>92.4%</div>
        </div>

        <div style={{ background: 'var(--anki-panel-bg)', padding: '16px', borderRadius: '10px', border: '1px solid var(--anki-border)', boxShadow: 'var(--anki-shadow)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', color: 'var(--anki-text-muted)' }}>Chuỗi Học (Streak)</span>
            <Award size={16} color="var(--anki-amber)" />
          </div>
          <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--anki-amber)' }}>14 <span style={{ fontSize: '13px', color: 'var(--anki-text-muted)', fontWeight: 'normal' }}>ngày</span></div>
        </div>

        <div style={{ background: 'var(--anki-panel-bg)', padding: '16px', borderRadius: '10px', border: '1px solid var(--anki-border)', boxShadow: 'var(--anki-shadow)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', color: 'var(--anki-text-muted)' }}>Thời Gian Ôn Trung Bình</span>
            <Clock size={16} color="#a855f7" />
          </div>
          <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--anki-text)' }}>6.8s <span style={{ fontSize: '13px', color: 'var(--anki-text-muted)', fontWeight: 'normal' }}>/thẻ</span></div>
        </div>
      </div>

      {/* Study Activity Heatmap */}
      <div style={{
        background: 'var(--anki-panel-bg)',
        borderRadius: '12px',
        border: '1px solid var(--anki-border)',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        boxShadow: 'var(--anki-shadow)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Calendar size={18} color="var(--anki-blue)" />
          <h3 style={{ fontSize: '15px', fontWeight: '600', color: 'var(--anki-text)' }}>Biểu Đồ Tần Suất Ôn Luyện (4 Tuần Gần Nhất)</h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' }}>
          {heatmapDays.map((item) => {
            let bg = 'var(--anki-card-sub)';
            let textColor = 'var(--anki-text)';
            if (item.count > 30) { bg = 'var(--anki-blue)'; textColor = '#ffffff'; }
            else if (item.count > 15) { bg = 'rgba(2, 132, 199, 0.6)'; textColor = '#ffffff'; }
            else if (item.count > 0) { bg = 'rgba(2, 132, 199, 0.2)'; textColor = 'var(--anki-text)'; }

            return (
              <div
                key={item.day}
                title={`Ngày ${item.day}: ${item.count} lượt ôn`}
                style={{
                  background: bg,
                  borderRadius: '6px',
                  height: '42px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: textColor,
                  fontSize: '11px',
                  border: '1px solid var(--anki-border)'
                }}
              >
                <span style={{ opacity: 0.7 }}>{item.day}</span>
                <span style={{ fontWeight: '700' }}>{item.count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* FSRS Retention Distribution */}
      <div style={{
        background: 'var(--anki-panel-bg)',
        borderRadius: '12px',
        border: '1px solid var(--anki-border)',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        boxShadow: 'var(--anki-shadow)'
      }}>
        <h3 style={{ fontSize: '15px', fontWeight: '600', color: 'var(--anki-text)' }}>Phân Nhóm Đánh Giá FSRS</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--anki-text-muted)', marginBottom: '4px' }}>
              <span>Easy (Dễ)</span>
              <span style={{ color: 'var(--anki-blue)', fontWeight: '700' }}>58%</span>
            </div>
            <div style={{ background: 'var(--anki-card-sub)', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: '58%', background: 'var(--anki-blue)', height: '100%' }} />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--anki-text-muted)', marginBottom: '4px' }}>
              <span>Good (Tốt)</span>
              <span style={{ color: 'var(--anki-green)', fontWeight: '700' }}>28%</span>
            </div>
            <div style={{ background: 'var(--anki-card-sub)', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: '28%', background: 'var(--anki-green)', height: '100%' }} />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--anki-text-muted)', marginBottom: '4px' }}>
              <span>Hard (Khó)</span>
              <span style={{ color: 'var(--anki-amber)', fontWeight: '700' }}>10%</span>
            </div>
            <div style={{ background: 'var(--anki-card-sub)', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: '10%', background: 'var(--anki-amber)', height: '100%' }} />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--anki-text-muted)', marginBottom: '4px' }}>
              <span>Again (Học Lại)</span>
              <span style={{ color: 'var(--anki-red)', fontWeight: '700' }}>4%</span>
            </div>
            <div style={{ background: 'var(--anki-card-sub)', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: '4%', background: 'var(--anki-red)', height: '100%' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
