import React from 'react';
import { Sun, Moon } from 'lucide-react';

export type TabType = 
  | 'decks' 
  | 'add' 
  | 'browse' 
  | 'practice' 
  | 'kaiwa' 
  | 'statistics' 
  | 'sync';

interface AnkiHeaderProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

export const AnkiHeader: React.FC<AnkiHeaderProps> = ({ activeTab, setActiveTab, theme, toggleTheme }) => {
  return (
    <header style={{
      background: 'var(--anki-header-bg)',
      borderBottom: '1px solid var(--anki-header-border)',
      display: 'flex',
      flexDirection: 'column',
      userSelect: 'none',
      boxShadow: 'var(--anki-shadow)',
      transition: 'background-color 0.2s ease'
    }}>
      {/* Top Native Window Menu Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '6px 16px',
        fontSize: '12px',
        color: 'var(--anki-text-muted)',
        borderBottom: '1px solid var(--anki-header-border)',
        background: 'var(--anki-header-menu-bg)'
      }}>
        <div style={{ display: 'flex', gap: '18px' }}>
          <span style={{ cursor: 'pointer' }}>Tập tin</span>
          <span style={{ cursor: 'pointer' }}>Chỉnh sửa</span>
          <span style={{ cursor: 'pointer' }}>Xem</span>
          <span style={{ cursor: 'pointer' }}>Công cụ</span>
          <span style={{ cursor: 'pointer' }}>Trợ giúp</span>
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          style={{
            background: 'var(--anki-card-sub)',
            border: '1px solid var(--anki-border)',
            borderRadius: '16px',
            padding: '3px 10px',
            fontSize: '12px',
            color: 'var(--anki-text)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontWeight: '600',
            transition: 'all 0.15s ease'
          }}
          title={theme === 'light' ? 'Chuyển sang Chế độ Tối' : 'Chuyển sang Chế độ Sáng'}
        >
          {theme === 'light' ? (
            <>
              <Moon size={13} color="#6366f1" />
              <span>Giao diện Tối</span>
            </>
          ) : (
            <>
              <Sun size={13} color="#f59e0b" />
              <span>Giao diện Sáng</span>
            </>
          )}
        </button>
      </div>

      {/* Top Center Main Navigation Tabs */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '10px 0',
        gap: '24px'
      }}>
        <button
          onClick={() => setActiveTab('decks')}
          style={{
            background: 'transparent',
            border: 'none',
            color: activeTab === 'decks' ? 'var(--anki-text)' : 'var(--anki-text-muted)',
            fontSize: '14px',
            fontWeight: activeTab === 'decks' ? '700' : '500',
            cursor: 'pointer',
            padding: '4px 8px',
            borderBottom: activeTab === 'decks' ? '2px solid var(--anki-blue)' : '2px solid transparent'
          }}
        >
          Bộ thẻ
        </button>

        <button
          onClick={() => setActiveTab('add')}
          style={{
            background: 'transparent',
            border: 'none',
            color: activeTab === 'add' ? 'var(--anki-text)' : 'var(--anki-text-muted)',
            fontSize: '14px',
            fontWeight: activeTab === 'add' ? '700' : '500',
            cursor: 'pointer',
            padding: '4px 8px',
            borderBottom: activeTab === 'add' ? '2px solid var(--anki-blue)' : '2px solid transparent'
          }}
        >
          Từ Vựng
        </button>

        <button
          onClick={() => setActiveTab('browse')}
          style={{
            background: 'transparent',
            border: 'none',
            color: activeTab === 'browse' ? 'var(--anki-text)' : 'var(--anki-text-muted)',
            fontSize: '14px',
            fontWeight: activeTab === 'browse' ? '700' : '500',
            cursor: 'pointer',
            padding: '4px 8px',
            borderBottom: activeTab === 'browse' ? '2px solid var(--anki-blue)' : '2px solid transparent'
          }}
        >
          Ngữ Pháp
        </button>

        <button
          onClick={() => setActiveTab('practice')}
          style={{
            background: 'transparent',
            border: 'none',
            color: activeTab === 'practice' ? 'var(--anki-text)' : 'var(--anki-text-muted)',
            fontSize: '14px',
            fontWeight: activeTab === 'practice' ? '700' : '500',
            cursor: 'pointer',
            padding: '4px 8px',
            borderBottom: activeTab === 'practice' ? '2px solid var(--anki-indigo)' : '2px solid transparent',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          Luyện Dịch AI
          <span style={{ fontSize: '9px', background: 'var(--anki-indigo)', color: '#fff', padding: '1px 5px', borderRadius: '4px' }}>AI</span>
        </button>

        <button
          onClick={() => setActiveTab('kaiwa')}
          style={{
            background: 'transparent',
            border: 'none',
            color: activeTab === 'kaiwa' ? 'var(--anki-text)' : 'var(--anki-text-muted)',
            fontSize: '14px',
            fontWeight: activeTab === 'kaiwa' ? '700' : '500',
            cursor: 'pointer',
            padding: '4px 8px',
            borderBottom: activeTab === 'kaiwa' ? '2px solid var(--anki-green)' : '2px solid transparent',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          AI Kaiwa
          <span style={{ fontSize: '9px', background: 'var(--anki-green)', color: '#fff', padding: '1px 5px', borderRadius: '4px' }}>AI</span>
        </button>

        <button
          onClick={() => setActiveTab('statistics')}
          style={{
            background: 'transparent',
            border: 'none',
            color: activeTab === 'statistics' ? 'var(--anki-text)' : 'var(--anki-text-muted)',
            fontSize: '14px',
            fontWeight: activeTab === 'statistics' ? '700' : '500',
            cursor: 'pointer',
            padding: '4px 8px',
            borderBottom: activeTab === 'statistics' ? '2px solid var(--anki-blue)' : '2px solid transparent'
          }}
        >
          Thống kê
        </button>

        <button
          onClick={() => setActiveTab('sync')}
          style={{
            background: 'transparent',
            border: 'none',
            color: activeTab === 'sync' ? 'var(--anki-text)' : 'var(--anki-text-muted)',
            fontSize: '14px',
            fontWeight: activeTab === 'sync' ? '700' : '500',
            cursor: 'pointer',
            padding: '4px 8px',
            borderBottom: activeTab === 'sync' ? '2px solid var(--anki-blue)' : '2px solid transparent'
          }}
        >
          Cấu hình
        </button>
      </div>
    </header>
  );
};

