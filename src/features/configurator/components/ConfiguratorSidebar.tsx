import React from 'react';
import { ConfiguratorState } from '../types/configurator.types';
import { calculateBasePrice, formatPrice } from '../lib/pricing';
import { TabNavigation } from './TabNavigation';
import { EngagementRingTab } from './EngagementRingTab';
import { EternitySelector } from './EternitySelector';

interface ConfiguratorSidebarProps {
  state: ConfiguratorState;
  updateState: (updates: Partial<ConfiguratorState>) => void;
  onOpenEnquiry: () => void;
}

export const ConfiguratorSidebar: React.FC<ConfiguratorSidebarProps> = ({
  state,
  updateState,
  onOpenEnquiry,
}) => {
  const currentPrice = calculateBasePrice({
    metalDelta: state.selectedMetal.priceDelta,
    caratDelta: state.selectedCarat.priceDelta,
    quality: state.selectedQuality,
    origin: state.selectedOrigin,
    eternityActive: state.eternityActive,
    eternityDelta: state.selectedEternity.priceDelta,
  });

  return (
    <aside className="w-full md:w-[30%] md:flex-none h-1/2 md:h-full overflow-hidden flex flex-col bg-white z-20 md:border-l border-t md:border-t-0 border-gray-200">
      <div className="h-full flex flex-col overflow-hidden relative">
        {/* Animated Loading Bar on top */}
        {state.isLoading && (
          <div className="absolute top-0 left-0 w-full h-[2px] z-[9999] overflow-hidden bg-gray-100">
            <div className="h-full w-[40%] bg-black animate-[loading-bar_1.6s_infinite_ease-in-out]" />
          </div>
        )}

        {/* Scrollable Content Container */}
        <div className="md:h-full md:overflow-y-auto md:overflow-x-hidden px-4 md:px-6 w-full pt-4 custom-scrollbar h-auto overflow-visible flex-1 pb-24 md:pb-6">
          {/* Header titles */}
          <div className="pt-2 flex flex-col justify-start items-start gap-1">
            <h1 className="text-2xl md:text-3xl font-normal text-gray-900 tracking-tight font-sans">
              Your Engagement Ring
            </h1>
            <p className="text-xs text-gray-500 font-sans leading-relaxed pt-1">
              Make it yours—design your perfect ring with Carpediam by choosing the
              shank, head, gold color, and diamond size.
            </p>
          </div>

          {/* Dynamic Price */}
          <div className="mt-4 md:mt-6">
            <span className="text-base font-normal text-gray-900 font-sans tracking-wide">
              {formatPrice(currentPrice)}
            </span>
          </div>

          {/* Tabs Navigation */}
          <TabNavigation
            activeTab={state.activeTab}
            onTabChange={(tab) => updateState({ activeTab: tab })}
          />

          {/* Tab Content */}
          {state.activeTab === 'engagement' ? (
            <EngagementRingTab state={state} updateState={updateState} />
          ) : (
            <EternitySelector
              state={state}
              onToggleEternity={(active) => updateState({ eternityActive: active })}
              onSelectEternity={(band) => updateState({ selectedEternity: band })}
            />
          )}
        </div>

        {/* Sticky Bottom Enquiry CTA Button */}
        <div className="p-4 md:p-6 bg-white border-t border-gray-100 flex-shrink-0">
          <button
            type="button"
            onClick={onOpenEnquiry}
            className="w-full py-3.5 bg-black text-white text-xs md:text-sm font-bold tracking-wider uppercase flex items-center justify-center gap-2.5 hover:bg-gray-800 transition-colors cursor-pointer shadow-sm rounded-none"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <span>INTERESTED, ENQUIRE?</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
