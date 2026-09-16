import React from 'react';
import { AnkiHeader, TabType } from './AnkiHeader';

interface MainLayoutProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ activeTab, setActiveTab, children }) => {
  return (
    <div className="anki-app-container">
      <AnkiHeader activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="anki-main-content">
        {children}
      </main>
    </div>
  );
};
