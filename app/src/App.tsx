import { useState } from 'react';
import { MainLayout } from './layouts/MainLayout';
import { TabType } from './layouts/Sidebar';
import { DashboardPage } from './features/dashboard/pages/DashboardPage';
import './styles/index.css';

export function App() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  return (
    <MainLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      <DashboardPage onNavigate={setActiveTab} />
    </MainLayout>
  );
}

export default App;
