import React from 'react';
import { useConfiguratorStore } from '../../store/useConfiguratorStore.js';
import { GemstoneType, StoneShape } from '@configurator/contracts';

interface GemOption {
  type: GemstoneType;
  label: string;
  color: string;
}

interface ShapeOption {
  shape: StoneShape;
  label: string;
}

const GEMSTONES: GemOption[] = [
  { type: 'DIAMOND_WHITE', label: 'White Diamond', color: '#FFFFFF' },
  { type: 'DIAMOND_YELLOW', label: 'Fancy Yellow', color: '#FFE853' },
  { type: 'DIAMOND_PINK', label: 'Fancy Pink', color: '#FFAED7' },
  { type: 'DIAMOND_BLUE', label: 'Fancy Blue', color: '#65D5FF' },
  { type: 'RUBY', label: 'Royal Ruby', color: '#E0115F' },
  { type: 'SAPPHIRE', label: 'Ceylon Sapphire', color: '#0F52BA' },
  { type: 'EMERALD', label: 'Zambian Emerald', color: '#50C878' }
];

const SHAPES: ShapeOption[] = [
  { shape: 'ROUND_BRILLIANT', label: 'Round' },
  { shape: 'OVAL', label: 'Oval' },
  { shape: 'EMERALD_CUT', label: 'Emerald' },
  { shape: 'PEAR', label: 'Pear' },
  { shape: 'CUSHION', label: 'Cushion' },
  { shape: 'PRINCESS', label: 'Princess' }
];

export const GemstoneSelector: React.FC = () => {
  const { config, setGemstoneType, setStoneShape } = useConfiguratorStore();

  return (
    <div className="space-y-6">
      {/* Stone Shape Selector */}
      <div>
        <label className="block text-xs font-semibold tracking-wider uppercase text-white/50 mb-3">
          Diamond Cut & Shape
        </label>
        <div className="grid grid-cols-3 gap-2">
          {SHAPES.map((s) => {
            const isSelected = config.stoneShape === s.shape;
            return (
              <button
                key={s.shape}
                onClick={() => setStoneShape(s.shape)}
                className={`py-2 px-3 rounded-lg border text-xs font-medium transition-all ${
                  isSelected
                    ? 'border-gold bg-gold/10 text-white'
                    : 'border-white/10 text-white/60 hover:border-white/20'
                }`}
              >
                {s.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Gemstone Variety & Color Tint */}
      <div>
        <label className="block text-xs font-semibold tracking-wider uppercase text-white/50 mb-3">
          Gemstone Variety & Color
        </label>
        <div className="grid grid-cols-2 gap-2.5">
          {GEMSTONES.map((g) => {
            const isSelected = config.gemstoneType === g.type;
            return (
              <button
                key={g.type}
                onClick={() => setGemstoneType(g.type)}
                className={`flex items-center gap-3 p-2.5 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'border-white bg-white/[0.08] shadow-[0_0_12px_rgba(255,255,255,0.15)]'
                    : 'border-white/10 hover:border-white/20 bg-white/[0.02]'
                }`}
              >
                <div
                  className="w-5 h-5 rounded-full shadow-md flex-shrink-0 border border-white/20"
                  style={{ backgroundColor: g.color }}
                />
                <span className={`text-xs font-medium ${isSelected ? 'text-white' : 'text-white/70'}`}>
                  {g.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
