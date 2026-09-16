import React from 'react';

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
}

export const AnkiHeader: React.FC<AnkiHeaderProps> = ({ activeTab, setActiveTab }) => {
  return (
    <header style={{
      background: '#232323',
      borderBottom: '1px solid #333333',
      display: 'flex',
      flexDirection: 'column',
      userSelect: 'none'
    }}>
      {/* Top Native Window Menu Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        padding: '4px 12px',
        fontSize: '12px',
        color: '#cccccc',
        gap: '16px',
        borderBottom: '1px solid rgba(255,255,255,0.05)'
      }}>
        <span style={{ cursor: 'pointer' }}>Tập tin</span>
        <span style={{ cursor: 'pointer' }}>Chỉnh sửa</span>
        <span style={{ cursor: 'pointer' }}>View</span>
        <span style={{ cursor: 'pointer' }}>Công cụ</span>
        <span style={{ cursor: 'pointer' }}>Giúp đỡ</span>
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
            color: activeTab === 'decks' ? '#ffffff' : '#b0b0b0',
            fontSize: '14px',
            fontWeight: activeTab === 'decks' ? '700' : '500',
            cursor: 'pointer',
            padding: '4px 8px',
            borderBottom: activeTab === 'decks' ? '2px solid #0099ff' : '2px solid transparent'
          }}
        >
          Bộ thẻ
        </button>

        <button
          onClick={() => setActiveTab('add')}
          style={{
            background: 'transparent',
            border: 'none',
            color: activeTab === 'add' ? '#ffffff' : '#b0b0b0',
            fontSize: '14px',
            fontWeight: activeTab === 'add' ? '700' : '500',
            cursor: 'pointer',
            padding: '4px 8px',
            borderBottom: activeTab === 'add' ? '2px solid #0099ff' : '2px solid transparent'
          }}
        >
          Thêm
        </button>

        <button
          onClick={() => setActiveTab('browse')}
          style={{
            background: 'transparent',
            border: 'none',
            color: activeTab === 'browse' ? '#ffffff' : '#b0b0b0',
            fontSize: '14px',
            fontWeight: activeTab === 'browse' ? '700' : '500',
            cursor: 'pointer',
            padding: '4px 8px',
            borderBottom: activeTab === 'browse' ? '2px solid #0099ff' : '2px solid transparent'
          }}
        >
          Duyệt
        </button>

        <button
          onClick={() => setActiveTab('practice')}
          style={{
            background: 'transparent',
            border: 'none',
            color: activeTab === 'practice' ? '#ffffff' : '#b0b0b0',
            fontSize: '14px',
            fontWeight: activeTab === 'practice' ? '700' : '500',
            cursor: 'pointer',
            padding: '4px 8px',
            borderBottom: activeTab === 'practice' ? '2px solid #6366f1' : '2px solid transparent',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          Luyện Dịch AI
          <span style={{ fontSize: '9px', background: '#6366f1', color: '#fff', padding: '1px 5px', borderRadius: '4px' }}>AI</span>
        </button>

        <button
          onClick={() => setActiveTab('kaiwa')}
          style={{
            background: 'transparent',
            border: 'none',
            color: activeTab === 'kaiwa' ? '#ffffff' : '#b0b0b0',
            fontSize: '14px',
            fontWeight: activeTab === 'kaiwa' ? '700' : '500',
            cursor: 'pointer',
            padding: '4px 8px',
            borderBottom: activeTab === 'kaiwa' ? '2px solid #10b981' : '2px solid transparent',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          AI Kaiwa
          <span style={{ fontSize: '9px', background: '#10b981', color: '#fff', padding: '1px 5px', borderRadius: '4px' }}>AI</span>
        </button>

        <button
          onClick={() => setActiveTab('statistics')}
          style={{
            background: 'transparent',
            border: 'none',
            color: activeTab === 'statistics' ? '#ffffff' : '#b0b0b0',
            fontSize: '14px',
            fontWeight: activeTab === 'statistics' ? '700' : '500',
            cursor: 'pointer',
            padding: '4px 8px',
            borderBottom: activeTab === 'statistics' ? '2px solid #0099ff' : '2px solid transparent'
          }}
        >
          Thống kê
        </button>

        <button
          onClick={() => setActiveTab('sync')}
          style={{
            background: 'transparent',
            border: 'none',
            color: activeTab === 'sync' ? '#ffffff' : '#b0b0b0',
            fontSize: '14px',
            fontWeight: activeTab === 'sync' ? '700' : '500',
            cursor: 'pointer',
            padding: '4px 8px',
            borderBottom: activeTab === 'sync' ? '2px solid #0099ff' : '2px solid transparent'
          }}
        >
          Đồng bộ
        </button>
      </div>
    </header>
  );
};
