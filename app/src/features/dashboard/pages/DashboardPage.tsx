import React from 'react';
import { Card } from '../../../components/ui/Card';
import { Sparkles, RotateCw, BookOpen, Puzzle } from 'lucide-react';
import { TabType } from '../../../layouts/Sidebar';

interface DashboardProps {
  onNavigate: (tab: TabType) => void;
}

export const DashboardPage: React.FC<DashboardProps> = ({ onNavigate }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h2 className="title-lg">Dashboard Tổng Quan</h2>
        <p className="text-muted" style={{ marginTop: '4px' }}>
          Chào mừng bạn quay trở lại! Hãy chọn một chế độ học để bắt đầu.
        </p>
      </div>

      {/* Quick Stats Banner */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <Card>
          <div style={{ fontSize: '13px', color: '#94a3b8' }}>Thẻ đến hạn hôm nay</div>
          <div style={{ fontSize: '28px', fontWeight: '700', color: '#6366f1', marginTop: '6px' }}>15 Cards</div>
        </Card>
        <Card>
          <div style={{ fontSize: '13px', color: '#94a3b8' }}>Từ vựng đã lưu</div>
          <div style={{ fontSize: '28px', fontWeight: '700', color: '#10b981', marginTop: '6px' }}>48 Words</div>
        </Card>
        <Card>
          <div style={{ fontSize: '13px', color: '#94a3b8' }}>Mẫu ngữ pháp</div>
          <div style={{ fontSize: '28px', fontWeight: '700', color: '#06b6d4', marginTop: '6px' }}>12 Patterns</div>
        </Card>
        <Card>
          <div style={{ fontSize: '13px', color: '#94a3b8' }}>Bài dịch câu AI đã hoàn thành</div>
          <div style={{ fontSize: '28px', fontWeight: '700', color: '#f59e0b', marginTop: '6px' }}>24 Sentences</div>
        </Card>
      </div>

      {/* Main Feature Banner Shortcuts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Practice AI Banner */}
        <Card hoverable className="glass-panel">
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
            <div style={{
              padding: '12px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(6,182,212,0.2))',
              color: '#6366f1'
            }}>
              <Sparkles size={28} />
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600' }}>Luyện Dịch Câu Với AI</h3>
              <p className="text-muted" style={{ fontSize: '13px', margin: '8px 0 16px 0' }}>
                AI sẽ duyệt danh sách từ vựng & ngữ pháp của bạn để tạo ra bài tập dịch câu Việt $\rightarrow$ Nhật phù hợp với trình độ.
              </p>
              <button className="btn btn-primary" onClick={() => onNavigate('practice')}>
                Bắt đầu luyện tập ngay
              </button>
            </div>
          </div>
        </Card>

        {/* AI Kaiwa Banner */}
        <Card hoverable className="glass-panel">
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
            <div style={{
              padding: '12px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, rgba(16,185,129,0.2), rgba(6,182,212,0.2))',
              color: '#10b981'
            }}>
              <RotateCw size={28} />
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600' }}>AI Text Kaiwa</h3>
              <p className="text-muted" style={{ fontSize: '13px', margin: '8px 0 16px 0' }}>
                Hội thoại tình huống với AI theo chủ đề N5/N4, phân tích lỗi ngữ pháp và gợi ý diễn đạt tự nhiên hơn.
              </p>
              <button className="btn btn-primary" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }} onClick={() => onNavigate('kaiwa')}>
                Mở phòng Kaiwa
              </button>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Navigation Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
        <Card hoverable>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <RotateCw size={20} color="#6366f1" />
            <h4 style={{ fontWeight: '600' }}>Ôn Tập Flashcard (FSRS)</h4>
          </div>
          <p className="text-muted" style={{ fontSize: '13px', marginBottom: '14px' }}>Luyện nhớ từ vựng ngắt quãng tối ưu theo thuật toán FSRS Anki.</p>
          <button className="btn btn-secondary" style={{ width: '100%' }} onClick={() => onNavigate('review')}>Vào phòng ôn tập</button>
        </Card>

        <Card hoverable>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <BookOpen size={20} color="#10b981" />
            <h4 style={{ fontWeight: '600' }}>Quản Lý Từ Vựng</h4>
          </div>
          <p className="text-muted" style={{ fontSize: '13px', marginBottom: '14px' }}>Thêm, sửa, lưu trữ các từ Kanji và Hiragana theo cấp độ N5/N4.</p>
          <button className="btn btn-secondary" style={{ width: '100%' }} onClick={() => onNavigate('vocabulary')}>Xem từ vựng</button>
        </Card>

        <Card hoverable>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <Puzzle size={20} color="#06b6d4" />
            <h4 style={{ fontWeight: '600' }}>Quản Lý Ngữ Pháp</h4>
          </div>
          <p className="text-muted" style={{ fontSize: '13px', marginBottom: '14px' }}>Lưu trữ cấu trúc và giải thích mẫu câu ngữ pháp JLPT.</p>
          <button className="btn btn-secondary" style={{ width: '100%' }} onClick={() => onNavigate('grammar')}>Xem ngữ pháp</button>
        </Card>
      </div>
    </div>
  );
};
