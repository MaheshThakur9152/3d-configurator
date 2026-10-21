import React from 'react';
import { ConfiguratorState } from '../../types/configurator';
import { ETERNITY_OPTIONS } from '../../data/configuratorData';

interface EternityRingTabProps {
  state: ConfiguratorState;
  updateState: (updates: Partial<ConfiguratorState>) => void;
}

export const EternityRingTab: React.FC<EternityRingTabProps> = ({
  state,
  updateState,
}) => {
  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-1.5 w-full pt-1 pb-3 flex-wrap">
        <span
          className="text-[14px] font-[400] font-sans"
          style={{ color: 'var(--config-text-primary)' }}
        >
          Eternity Ring:
        </span>
        {state.eternityActive && (
          <span
            className="text-[14px] font-[300] font-sans"
            style={{ color: 'var(--config-text-secondary)' }}
          >
            {state.selectedEternity.name}
          </span>
        )}
      </div>

      {/* Pill Toggle Buttons */}
      <div className="flex items-center gap-3 mb-6">
        <button
          type="button"
          onClick={() => updateState({ eternityActive: false })}
          className={`flex-1 py-2.5 px-4 text-xs font-semibold rounded-lg transition-all tracking-wider uppercase cursor-pointer ${
            !state.eternityActive
              ? 'border-[1.5px] border-black text-black bg-white shadow-sm'
              : 'border border-gray-300 text-gray-400 bg-white hover:border-gray-400'
          }`}
        >
          NO ETERNITY
        </button>

        <button
          type="button"
          onClick={() => updateState({ eternityActive: true })}
          className={`flex-1 py-2.5 px-4 text-xs font-semibold rounded-lg transition-all tracking-wider uppercase cursor-pointer ${
            state.eternityActive
              ? 'border-[1.5px] border-black text-black bg-white shadow-sm'
              : 'border border-gray-300 text-gray-400 bg-white hover:border-gray-400'
          }`}
        >
          ADD ETERNITY
        </button>
      </div>

      {/* Eternity Bands Grid */}
      {state.eternityActive && (
        <div className="grid grid-cols-3 gap-4 pb-4">
          {ETERNITY_OPTIONS.map((band) => {
            const isSelected = band.id === state.selectedEternity.id;
            return (
              <div
                key={band.id}
                className="relative group hover-indicator cursor-pointer flex flex-col items-center"
                onClick={() => updateState({ selectedEternity: band })}
              >
                <div
                  className={`w-[68px] h-[68px] rounded-full flex items-center justify-center transition-all duration-200 ${
                    isSelected
                      ? 'border-[1.5px] border-black p-1'
                      : 'border border-transparent hover:border-gray-300 p-1'
                  }`}
                >
                  <img
                    src={band.thumbnail}
                    alt={band.name}
                    className="w-full h-full object-contain"
                  />
                </div>

                {/* Tooltip on Hover */}
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2.5 py-1 bg-gray-900 text-white text-[10px] tracking-wide whitespace-nowrap rounded font-semibold shadow-xl opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 pointer-events-none z-50 uppercase">
                  {band.name}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-x-[4px] border-x-transparent border-t-[4px] border-t-gray-900" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
