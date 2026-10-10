import { useState, useEffect } from 'react';
import { MainLayout } from './layouts/MainLayout';
import { TabType } from './layouts/AnkiHeader';
import { DecksPage } from './features/decks/pages/DecksPage';
import { VocabularyPage } from './features/vocabulary/pages/VocabularyPage';
import { GrammarPage } from './features/grammar/pages/GrammarPage';
import { PracticePage } from './features/practice/pages/PracticePage';
import { KaiwaPage } from './features/kaiwa/pages/KaiwaPage';
import { ReviewPage } from './features/review/pages/ReviewPage';
import { StatisticsPage } from './features/statistics/pages/StatisticsPage';
import { SettingsPage } from './features/settings/pages/SettingsPage';
import { api } from './services/apiConfig';
import { X } from 'lucide-react';
import './styles/index.css';

export function App() {
  const [activeTab, setActiveTab] = useState<TabType>('review');
  const [showQuickAddModal, setShowQuickAddModal] = useState<boolean>(false);
  const [quickWord, setQuickWord] = useState<string>('');
  const [quickReading, setQuickReading] = useState<string>('');
  const [quickMeaning, setQuickMeaning] = useState<string>('');
  const [quickLevel, setQuickLevel] = useState<string>('N4');

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('nihongoai-theme') as 'light' | 'dark') || 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('nihongoai-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const handleQuickAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickWord.trim() || !quickMeaning.trim()) return;

    await api.createVocabulary({
      word: quickWord.trim(),
      reading: quickReading.trim(),
      meaningVi: quickMeaning.trim(),
      jlptLevel: quickLevel,
      partOfSpeech: 'Danh từ'
    });

    setQuickWord('');
    setQuickReading('');
    setQuickMeaning('');
    setShowQuickAddModal(false);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'review':
        return <ReviewPage onBackToDecks={() => setActiveTab('decks')} />;
      case 'decks':
        return <DecksPage onStudyDeck={() => setActiveTab('review')} />;
      case 'add':
        return <VocabularyPage />;
      case 'browse':
        return <GrammarPage />;
      case 'practice':
        return <PracticePage />;
      case 'kaiwa':
        return <KaiwaPage />;
      case 'statistics':
        return <StatisticsPage />;
      case 'sync':
        return <SettingsPage />;
      default:
        return <ReviewPage onBackToDecks={() => setActiveTab('decks')} />;
    }
  };

  return (
    <MainLayout 
      activeTab={activeTab} 
      setActiveTab={setActiveTab} 
      theme={theme} 
      toggleTheme={toggleTheme}
      onQuickAdd={() => setShowQuickAddModal(true)}
    >
      {renderContent()}

      {/* Quick Add Vocabulary Modal */}
      {showQuickAddModal && (
        <div className="modal-backdrop" onClick={() => setShowQuickAddModal(false)}>
          <div className="modal-box" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
            <form onSubmit={handleQuickAddSubmit}>
              <div className="modal-head">
                <h3 className="modal-heading">Thêm Từ Vựng Nhanh</h3>
                <button type="button" className="btn-tactile sm" onClick={() => setShowQuickAddModal(false)}>
                  <X size={16} />
                </button>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label className="form-label">Từ vựng (Kanji):</label>
                <input
                  type="text"
                  className="form-input-text"
                  placeholder="Ví dụ: 勉強"
                  value={quickWord}
                  onChange={(e) => setQuickWord(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label className="form-label">Cách đọc (Hiragana):</label>
                <input
                  type="text"
                  className="form-input-text"
                  placeholder="Ví dụ: べんきょう"
                  value={quickReading}
                  onChange={(e) => setQuickReading(e.target.value)}
                  required
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label className="form-label">Nghĩa Tiếng Việt:</label>
                <input
                  type="text"
                  className="form-input-text"
                  placeholder="Ví dụ: Học hành / Học tập"
                  value={quickMeaning}
                  onChange={(e) => setQuickMeaning(e.target.value)}
                  required
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label className="form-label">Cấp độ JLPT:</label>
                <select
                  className="form-select"
                  value={quickLevel}
                  onChange={(e) => setQuickLevel(e.target.value)}
                >
                  <option value="N5">N5</option>
                  <option value="N4">N4</option>
                  <option value="N3">N3</option>
                </select>
              </div>

              <div className="modal-foot">
                <button type="button" className="btn-tactile" onClick={() => setShowQuickAddModal(false)}>
                  Hủy
                </button>
                <button type="submit" className="btn-tactile primary">
                  Thêm Ngay
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </MainLayout>
  );
}

export default App;
