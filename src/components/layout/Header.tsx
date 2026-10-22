import React from 'react';

interface HeaderProps {
  currentView?: 'configurator' | 'inspector';
  onViewChange?: (view: 'configurator' | 'inspector') => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView = 'configurator',
  onViewChange,
}) => {
  return (
    <header className="w-full bg-white border-b border-gray-200 flex-shrink-0 z-30">
      <div className="mx-auto px-4 md:px-6 py-2 md:py-3.5 grid grid-cols-3 items-center">
        {/* Left: Mode Switcher (Customer Configurator vs Designer Inspector) */}
        <div className="flex justify-start items-center">
          <div className="flex items-center gap-1 bg-gray-100 p-0.5 rounded-lg border border-gray-200/80">
            <button
              type="button"
              onClick={() => onViewChange?.('configurator')}
              className={`px-2.5 py-1 text-xs rounded-md transition-all cursor-pointer ${
                currentView === 'configurator'
                  ? 'bg-white text-gray-900 shadow-xs font-semibold'
                  : 'text-gray-500 hover:text-gray-900 font-medium'
              }`}
            >
              Configurator
            </button>
            <button
              type="button"
              onClick={() => onViewChange?.('inspector')}
              className={`px-2.5 py-1 text-xs rounded-md transition-all cursor-pointer ${
                currentView === 'inspector'
                  ? 'bg-white text-gray-900 shadow-xs font-semibold'
                  : 'text-gray-500 hover:text-gray-900 font-medium'
              }`}
            >
              Model Inspector
            </button>
          </div>
        </div>

        {/* Center: Brand Typography */}
        <div className="flex justify-center">
          <a
            className="flex items-center gap-2 md:scale-110 transition-transform"
            href="/"
          >
            <span className="font-bold text-gray-900 text-lg md:text-xl tracking-tight">Carpediam</span>
          </a>
        </div>

        {/* Right: Action */}
        <div className="flex justify-end">
          <a
            className="flex items-center gap-1.5 md:gap-2 px-3 py-1.5 md:px-5 md:py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-all font-medium group"
            href="/auth/login"
          >
            <span className="text-xs md:text-sm">Sign in</span>
          </a>
        </div>
      </div>
    </header>
  );
};
