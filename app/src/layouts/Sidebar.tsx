import React from 'react';
import { 
  LayoutDashboard, 
  Layers, 
  RotateCw, 
  BookOpen, 
  Puzzle, 
  Sparkles, 
  MessageSquare, 
  BarChart3, 
  Settings 
} from 'lucide-react';

export type TabType = 
  | 'dashboard' 
  | 'decks' 
  | 'review' 
  | 'vocabulary' 
  | 'grammar' 
  | 'practice' 
  | 'kaiwa' 
  | 'statistics' 
  | 'settings';

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'dashboard' as TabType, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'decks' as TabType, label: 'Decks (Anki)', icon: Layers },
    { id: 'review' as TabType, label: 'Ôn Tập Flashcard', icon: RotateCw },
    { id: 'vocabulary' as TabType, label: 'Kho Từ Vựng', icon: BookOpen },
    { id: 'grammar' as TabType, label: 'Kho Ngữ Pháp', icon: Puzzle },
    { id: 'practice' as TabType, label: 'Luyện Dịch AI', icon: Sparkles, highlight: true },
    { id: 'kaiwa' as TabType, label: 'AI Kaiwa', icon: MessageSquare, highlight: true },
    { id: 'statistics' as TabType, label: 'Thống Kê Tiến Độ', icon: BarChart3 },
    { id: 'settings' as TabType, label: 'Cài Đặt AI', icon: Settings },
  ];

  return (
    <aside style={{
      width: '260px',
      background: 'rgba(15, 23, 42, 0.95)',
      borderRight: '1px solid var(--border-color)',
      display: 'flex',
      flexDirection: 'column',
      padding: '20px 14px',
      gap: '8px'
    }}>
      {/* Brand Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 12px', marginBottom: '16px' }}>
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: '10px',
          background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '20px',
          fontWeight: 'bold',
          boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)'
        }}>
          日
        </div>
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: '700', letterSpacing: '-0.5px' }}>NihongoAI</h1>
          <span style={{ fontSize: '11px', color: '#94a3b8' }}>Japanese AI Flashcard</span>
        </div>
      </div>

      {/* Navigation List */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 14px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: isActive ? '600' : '400',
                background: isActive 
                  ? (item.highlight ? 'linear-gradient(135deg, rgba(99,102,241,0.25), rgba(6,182,212,0.2))' : 'rgba(255,255,255,0.08)')
                  : 'transparent',
                color: isActive ? '#f8fafc' : '#94a3b8',
                borderLeft: isActive ? '3px solid #6366f1' : '3px solid transparent',
                transition: 'all 0.15s ease'
              }}
            >
              <Icon size={18} color={isActive ? '#6366f1' : '#94a3b8'} />
              <span>{item.label}</span>
              {item.highlight && (
                <span style={{
                  marginLeft: 'auto',
                  fontSize: '9px',
                  fontWeight: '700',
                  padding: '2px 6px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
                  color: '#fff'
                }}>
                  AI
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Status Info */}
      <div style={{ padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', fontSize: '12px' }}>
        <div style={{ color: '#94a3b8', marginBottom: '4px' }}>Trình độ hiện tại</div>
        <div style={{ fontWeight: '600', color: '#10b981', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></span>
          JLPT N4 - Beginner
        </div>
      </div>
    </aside>
  );
};
