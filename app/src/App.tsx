import { useState } from 'react';
import { MainLayout } from './layouts/MainLayout';
import { TabType } from './layouts/AnkiHeader';
import { DecksPage } from './features/decks/pages/DecksPage';
import { VocabularyPage } from './features/vocabulary/pages/VocabularyPage';
import { GrammarPage } from './features/grammar/pages/GrammarPage';
import './styles/index.css';

export function App() {
  const [activeTab, setActiveTab] = useState<TabType>('decks');

  const renderContent = () => {
    switch (activeTab) {
      case 'decks':
        return <DecksPage />;
      case 'add':
        return <VocabularyPage />;
      case 'browse':
        return <GrammarPage />;
      default:
        return <DecksPage />;
    }
  };

  return (
    <MainLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderContent()}
    </MainLayout>
  );
}

export default App;
