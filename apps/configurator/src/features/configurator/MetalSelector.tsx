import React from 'react';
import { useConfiguratorStore } from '../../store/useConfiguratorStore.js';
import { MetalType } from '@configurator/contracts';

interface MetalOption {
  type: MetalType;
  label: string;
  gradient: string;
  border: string;
}

const METALS: MetalOption[] = [
  {
    type: '18K_YELLOW_GOLD',
    label: '18K Yellow Gold',
    gradient: 'from-[#FBE7A1] via-[#E2BF7F] to-[#B8860B]',
    border: 'border-[#E2BF7F]'
  },
  {
    type: '18K_WHITE_GOLD',
    label: '18K White Gold',
    gradient: 'from-[#FFFFFF] via-[#EAEAEF] to-[#C0C0C8]',
    border: 'border-[#EAEAEF]'
  },
  {
    type: '18K_ROSE_GOLD',
    label: '18K Rose Gold',
    gradient: 'from-[#FBD3CA] via-[#E8A399] to-[#B36B61]',
    border: 'border-[#E8A399]'
  },
  {
    type: 'PLATINUM_950',
    label: '950 Platinum',
    gradient: 'from-[#F0F0F5] via-[#D5D5DC] to-[#A0A0AA]',
    border: 'border-[#D5D5DC]'
  }
];

export const MetalSelector: React.FC = () => {
  const { config, setMetalType, setMetalFinish } = useConfiguratorStore();

  return (
    <div className="space-y-6">
      {/* Metal Alloy Selector */}
      <div>
        <label className="block text-xs font-semibold tracking-wider uppercase text-white/50 mb-3">
          Precious Metal Selection
        </label>
        <div className="grid grid-cols-2 gap-2.5">
          {METALS.map((m) => {
            const isSelected = config.metalType === m.type;
            return (
              <button
                key={m.type}
                onClick={() => setMetalType(m.type)}
                className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                  isSelected
                    ? `${m.border} bg-white/[0.08] shadow-[0_0_15px_rgba(226,191,127,0.15)]`
                    : 'border-white/10 hover:border-white/20 bg-white/[0.02]'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-full bg-gradient-to-tr ${m.gradient} shadow-inner flex-shrink-0 ${
                    isSelected ? 'ring-2 ring-white/50 ring-offset-2 ring-offset-[#121216]' : ''
                  }`}
                />
                <span className={`text-xs font-medium ${isSelected ? 'text-white' : 'text-white/70'}`}>
                  {m.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Surface Finish Selector */}
      <div>
        <label className="block text-xs font-semibold tracking-wider uppercase text-white/50 mb-3">
          Surface Finish
        </label>
        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={() => setMetalFinish('HIGH_POLISH')}
            className={`py-2.5 px-3 rounded-xl border text-xs font-medium text-center transition-all ${
              config.metalFinish === 'HIGH_POLISH'
                ? 'border-gold text-white bg-gold/10'
                : 'border-white/10 text-white/60 hover:border-white/20'
            }`}
          >
            Mirror High Polish
          </button>
          <button
            onClick={() => setMetalFinish('SATIN_BRUSHED')}
            className={`py-2.5 px-3 rounded-xl border text-xs font-medium text-center transition-all ${
              config.metalFinish === 'SATIN_BRUSHED'
                ? 'border-gold text-white bg-gold/10'
                : 'border-white/10 text-white/60 hover:border-white/20'
            }`}
          >
            Satin Brushed Matte
          </button>
        </div>
      </div>
    </div>
  );
};
