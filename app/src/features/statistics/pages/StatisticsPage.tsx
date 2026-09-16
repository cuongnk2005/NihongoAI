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
          <BarChart3 size={24} color="#0099ff" />
          <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#ffffff' }}>Thống Kê Tiến Độ Học Tập</h2>
        </div>
        <p style={{ fontSize: '13px', color: '#999999', marginTop: '4px' }}>
          Tổng hợp thông số ôn luyện FSRS, tỉ lệ ghi nhớ từ vựng và chuỗi ngày học tập (Streak).
        </p>
      </div>

      {/* Top 4 Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>
        <div style={{ background: '#1f1f1f', padding: '16px', borderRadius: '10px', border: '1px solid #333333' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', color: '#aaaaaa' }}>Thẻ Ôn Hôm Nay</span>
            <CheckCircle2 size={16} color="#2ecc71" />
          </div>
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#ffffff' }}>42 <span style={{ fontSize: '13px', color: '#aaaaaa', fontWeight: 'normal' }}>thẻ</span></div>
        </div>

        <div style={{ background: '#1f1f1f', padding: '16px', borderRadius: '10px', border: '1px solid #333333' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', color: '#aaaaaa' }}>Tỉ Lệ Ghi Nhớ</span>
            <TrendingUp size={16} color="#0099ff" />
          </div>
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#0099ff' }}>92.4%</div>
        </div>

        <div style={{ background: '#1f1f1f', padding: '16px', borderRadius: '10px', border: '1px solid #333333' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', color: '#aaaaaa' }}>Chuỗi Học (Streak)</span>
            <Award size={16} color="#f59e0b" />
          </div>
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#f59e0b' }}>14 <span style={{ fontSize: '13px', color: '#aaaaaa', fontWeight: 'normal' }}>ngày</span></div>
        </div>

        <div style={{ background: '#1f1f1f', padding: '16px', borderRadius: '10px', border: '1px solid #333333' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', color: '#aaaaaa' }}>Thời Gian Ôn Trung Bình</span>
            <Clock size={16} color="#a855f7" />
          </div>
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#ffffff' }}>6.8s <span style={{ fontSize: '13px', color: '#aaaaaa', fontWeight: 'normal' }}>/thẻ</span></div>
        </div>
      </div>

      {/* Study Activity Heatmap */}
      <div style={{
        background: '#1f1f1f',
        borderRadius: '12px',
        border: '1px solid #333333',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Calendar size={18} color="#0099ff" />
          <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#ffffff' }}>Biểu Đồ Tần Suất Ôn Luyện (4 Tuần Gần Nhất)</h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' }}>
          {heatmapDays.map((item) => {
            let bg = '#282828';
            if (item.count > 30) bg = '#0099ff';
            else if (item.count > 15) bg = 'rgba(0, 153, 255, 0.6)';
            else if (item.count > 0) bg = 'rgba(0, 153, 255, 0.25)';

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
                  color: '#ffffff',
                  fontSize: '11px',
                  border: '1px solid rgba(255,255,255,0.05)'
                }}
              >
                <span style={{ opacity: 0.6 }}>{item.day}</span>
                <span style={{ fontWeight: '700' }}>{item.count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* FSRS Retention Distribution */}
      <div style={{
        background: '#1f1f1f',
        borderRadius: '12px',
        border: '1px solid #333333',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px'
      }}>
        <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#ffffff' }}>Phân Nhóm Đánh Giá FSRS</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#aaaaaa', marginBottom: '4px' }}>
              <span>Easy (Dễ)</span>
              <span style={{ color: '#0099ff', fontWeight: '700' }}>58%</span>
            </div>
            <div style={{ background: '#282828', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: '58%', background: '#0099ff', height: '100%' }} />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#aaaaaa', marginBottom: '4px' }}>
              <span>Good (Tốt)</span>
              <span style={{ color: '#2ecc71', fontWeight: '700' }}>28%</span>
            </div>
            <div style={{ background: '#282828', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: '28%', background: '#2ecc71', height: '100%' }} />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#aaaaaa', marginBottom: '4px' }}>
              <span>Hard (Khó)</span>
              <span style={{ color: '#f59e0b', fontWeight: '700' }}>10%</span>
            </div>
            <div style={{ background: '#282828', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: '10%', background: '#f59e0b', height: '100%' }} />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#aaaaaa', marginBottom: '4px' }}>
              <span>Again (Học Lại)</span>
              <span style={{ color: '#ff4d4d', fontWeight: '700' }}>4%</span>
            </div>
            <div style={{ background: '#282828', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: '4%', background: '#ff4d4d', height: '100%' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
