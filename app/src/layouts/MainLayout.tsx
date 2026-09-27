import React from 'react';
import { AnkiHeader, TabType } from './AnkiHeader';

interface MainLayoutProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ activeTab, setActiveTab, theme, toggleTheme, children }) => {
  return (
    <div className="anki-app-container">
      <AnkiHeader activeTab={activeTab} setActiveTab={setActiveTab} theme={theme} toggleTheme={toggleTheme} />
      <main className="anki-main-content">
        {children}
      </main>
    </div>
  );
};

