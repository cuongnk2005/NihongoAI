import { useState, useEffect } from 'react';
import { MainLayout } from './layouts/MainLayout';
import { TabType } from './layouts/AnkiHeader';
import { DecksPage } from './features/decks/pages/DecksPage';
import { GrammarPage } from './features/grammar/pages/GrammarPage';
import { PracticePage } from './features/practice/pages/PracticePage';
import { KaiwaPage } from './features/kaiwa/pages/KaiwaPage';
import { ReviewPage } from './features/review/pages/ReviewPage';
import { StatisticsPage } from './features/statistics/pages/StatisticsPage';
import { SettingsPage } from './features/settings/pages/SettingsPage';
import { PvpPage } from './features/pvp/PvpPage';
import { Flashcard } from './types';
import './styles/index.css';
import './styles/mobile.css';

export function App() {
  const [activeTab, setActiveTab] = useState<TabType>(() => new URLSearchParams(window.location.search).has('room') ? 'pvp' : 'decks');
  const [studyingDeck, setStudyingDeck] = useState<{ id: string; name: string; cards: Flashcard[] } | null>(null);

  const handleStudyDeck = (deck: { id: string; name: string; cards: Flashcard[] }) => {
    setStudyingDeck(deck);
    setActiveTab('review');
  };

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

  const renderContent = () => {
    switch (activeTab) {
      case 'pvp':
        return <PvpPage />;
      case 'review':
        return (
          <ReviewPage 
            deckTitle={studyingDeck?.name}
            customCards={studyingDeck?.cards}
            onBackToDecks={() => setActiveTab('decks')} 
          />
        );
      case 'decks':
        return <DecksPage onStudyDeck={handleStudyDeck} />;
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
        return <DecksPage onStudyDeck={handleStudyDeck} />;
    }
  };

  return (
    <MainLayout 
      activeTab={activeTab} 
      setActiveTab={setActiveTab} 
      theme={theme} 
      toggleTheme={toggleTheme}
    >
      {renderContent()}

    </MainLayout>
  );
}

export default App;
