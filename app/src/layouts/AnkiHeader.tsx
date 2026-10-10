import React from 'react';
import { Sun, Moon, Layers, BookOpen, Scroll, PenTool, MessageSquare, BarChart2, Settings, Zap } from 'lucide-react';

export type TabType = 
  | 'review'
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
  onQuickAdd?: () => void;
}

export const AnkiHeader: React.FC<AnkiHeaderProps> = ({ 
  activeTab, 
  setActiveTab, 
  theme, 
  toggleTheme,
  onQuickAdd
}) => {
  return (
    <header className="app-header">
      {/* Brand Section */}
      <div className="brand-section" onClick={() => setActiveTab('decks')}>
        <div className="brand-stamp">日</div>
        <div className="brand-title">NihongoAI</div>
        <span className="brand-badge">Kyoto Studio</span>
      </div>

      {/* Main Navigation Tabs */}
      <nav className="app-nav">
        <button
          onClick={() => setActiveTab('review')}
          className={`nav-tab ${activeTab === 'review' ? 'active' : ''}`}
          id="tabReview"
        >
          <Zap size={16} />
          <span>Ôn tập Flashcard</span>
        </button>

        <button
          onClick={() => setActiveTab('decks')}
          className={`nav-tab ${activeTab === 'decks' ? 'active' : ''}`}
          id="tabDecks"
        >
          <Layers size={16} />
          <span>Bộ thẻ</span>
        </button>

        <button
          onClick={() => setActiveTab('add')}
          className={`nav-tab ${activeTab === 'add' ? 'active' : ''}`}
          id="tabVocabulary"
        >
          <BookOpen size={16} />
          <span>Từ vựng</span>
        </button>

        <button
          onClick={() => setActiveTab('browse')}
          className={`nav-tab ${activeTab === 'browse' ? 'active' : ''}`}
          id="tabGrammar"
        >
          <Scroll size={16} />
          <span>Ngữ pháp</span>
        </button>

        <button
          onClick={() => setActiveTab('practice')}
          className={`nav-tab ${activeTab === 'practice' ? 'active' : ''}`}
          id="tabPractice"
        >
          <PenTool size={16} />
          <span>Luyện dịch AI</span>
        </button>

        <button
          onClick={() => setActiveTab('kaiwa')}
          className={`nav-tab ${activeTab === 'kaiwa' ? 'active' : ''}`}
          id="tabKaiwa"
        >
          <MessageSquare size={16} />
          <span>AI Kaiwa</span>
        </button>

        <button
          onClick={() => setActiveTab('statistics')}
          className={`nav-tab ${activeTab === 'statistics' ? 'active' : ''}`}
          id="tabStats"
        >
          <BarChart2 size={16} />
          <span>Thống kê</span>
        </button>

        <button
          onClick={() => setActiveTab('sync')}
          className={`nav-tab ${activeTab === 'sync' ? 'active' : ''}`}
          id="tabSettings"
        >
          <Settings size={16} />
          <span>Cài đặt</span>
        </button>
      </nav>

      {/* Header Actions */}
      <div className="header-actions">
        {onQuickAdd && (
          <button 
            className="btn-tactile primary sm"
            onClick={onQuickAdd}
            title="Thêm từ vựng nhanh"
          >
            + Thêm từ
          </button>
        )}

        <button
          onClick={toggleTheme}
          className="btn-tactile sm"
          title={theme === 'light' ? 'Chuyển sang Chế độ Đêm (Kyoto Night)' : 'Chuyển sang Chế độ Ngày (Kyoto Daylight)'}
        >
          {theme === 'light' ? (
            <>
              <Moon size={15} color="#4F46E5" />
              <span style={{ fontSize: '0.8rem' }}>Đêm</span>
            </>
          ) : (
            <>
              <Sun size={15} color="#F59E0B" />
              <span style={{ fontSize: '0.8rem' }}>Ngày</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
};
