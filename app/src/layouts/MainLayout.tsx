import React from 'react';
import { AnkiHeader, TabType } from './AnkiHeader';

interface MainLayoutProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  onQuickAdd?: () => void;
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ 
  activeTab, 
  setActiveTab, 
  theme, 
  toggleTheme, 
  onQuickAdd,
  children 
}) => {
  return (
    <div className="app-container">
      <AnkiHeader 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        theme={theme} 
        toggleTheme={toggleTheme} 
        onQuickAdd={onQuickAdd}
      />
      <main className="main-content">
        {children}
      </main>
    </div>
  );
};
