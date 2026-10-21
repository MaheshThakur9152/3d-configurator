import React from 'react';
import { TabType } from '../types/configurator.types';

interface TabNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({
  activeTab,
  onTabChange,
}) => {
  return (
    <div className="flex border-b border-gray-200 mt-4 md:mt-6 mb-4">
      <button
        type="button"
        onClick={() => onTabChange('engagement')}
        className={`pb-2 text-[14px] font-sans mr-6 relative transition-colors ${
          activeTab === 'engagement'
            ? 'text-gray-900 font-medium'
            : 'text-gray-500 hover:text-gray-800'
        }`}
      >
        Engagement Ring
        {activeTab === 'engagement' && (
          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-black" />
        )}
      </button>
      <button
        type="button"
        onClick={() => onTabChange('eternity')}
        className={`pb-2 text-[14px] font-sans relative transition-colors ${
          activeTab === 'eternity'
            ? 'text-gray-900 font-medium'
            : 'text-gray-500 hover:text-gray-800'
        }`}
      >
        Eternity Ring
        {activeTab === 'eternity' && (
          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-black" />
        )}
      </button>
    </div>
  );
};
