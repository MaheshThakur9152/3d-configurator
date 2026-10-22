import React, { ReactNode } from 'react';
import { Header } from './Header';

interface MainLayoutProps {
  isFullscreen?: boolean;
  currentView?: 'configurator' | 'inspector';
  onViewChange?: (view: 'configurator' | 'inspector') => void;
  children: ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  isFullscreen = false,
  currentView = 'configurator',
  onViewChange,
  children,
}) => {
  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-white">
      {/* Top Header (hidden in full screen mode) */}
      {!isFullscreen && (
        <Header currentView={currentView} onViewChange={onViewChange} />
      )}

      {/* Main Content Layout: 70% Viewer / 30% Sidebar on Desktop, 50% / 50% Stacked on Mobile */}
      <main className="flex-1 min-h-0 bg-white relative overflow-hidden flex flex-col md:flex-row">
        {children}
      </main>
    </div>
  );
};
