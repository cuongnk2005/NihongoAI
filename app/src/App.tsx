import { useState } from 'react';
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
import './styles/index.css';

export function App() {
  const [activeTab, setActiveTab] = useState<TabType>('decks');
  const [isReviewing, setIsReviewing] = useState<boolean>(false);

  const renderContent = () => {
    if (isReviewing) {
      return <ReviewPage />;
    }

    switch (activeTab) {
      case 'decks':
        return <DecksPage onStudyDeck={() => setIsReviewing(true)} />;
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
        return <DecksPage onStudyDeck={() => setIsReviewing(true)} />;
    }
  };

  const handleTabChange = (tab: TabType) => {
    setIsReviewing(false);
    setActiveTab(tab);
  };

  return (
    <MainLayout activeTab={activeTab} setActiveTab={handleTabChange}>
      {renderContent()}
    </MainLayout>
  );
}

export default App;
