import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="w-full bg-white border-b border-gray-200 flex-shrink-0 z-30">
      <div className="mx-auto px-4 md:px-6 py-2 md:py-4 grid grid-cols-3 items-center">
        <div className="flex justify-start"></div>
        <div className="flex justify-center">
          <a
            className="flex items-center gap-2 md:scale-110 transition-transform"
            href="/"
          >
            <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
              <img
                alt="Carpediam"
                className="w-full h-full object-contain"
                src="/assets/logo.png"
              />
            </div>
            <span className="font-bold text-gray-900 text-lg tracking-tight">Carpediam</span>
          </a>
        </div>
        <div className="flex justify-end">
          <a
            className="flex items-center gap-1.5 md:gap-2 px-3 py-1.5 md:px-5 md:py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-all font-medium group"
            href="/auth/login"
          >
            <span className="text-xs md:text-sm lg:text-base">Sign in</span>
          </a>
        </div>
      </div>
    </header>
  );
};
