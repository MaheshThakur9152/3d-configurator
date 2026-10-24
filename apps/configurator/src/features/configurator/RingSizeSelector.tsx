import React from 'react';
import { useConfiguratorStore } from '../../store/useConfiguratorStore.js';

const US_SIZES = [4.0, 4.5, 5.0, 5.5, 6.0, 6.5, 7.0, 7.5, 8.0, 8.5, 9.0, 9.5, 10.0];

export const RingSizeSelector: React.FC = () => {
  const { config, setFingerSize, setHeadStyle } = useConfiguratorStore();

  return (
    <div className="space-y-6">
      {/* Finger Size Selection */}
      <div>
        <label className="block text-xs font-semibold tracking-wider uppercase text-white/50 mb-3">
          Finger Ring Size (US Standard)
        </label>
        <div className="grid grid-cols-4 gap-2">
          {US_SIZES.map((size) => {
            const isSelected = config.fingerSizeUS === size;
            return (
              <button
                key={size}
                onClick={() => setFingerSize(size)}
                className={`py-2 rounded-lg border text-xs font-medium font-mono transition-all ${
                  isSelected
                    ? 'border-gold bg-gold/10 text-white shadow-sm'
                    : 'border-white/10 text-white/60 hover:border-white/20'
                }`}
              >
                {size.toFixed(1)}
              </button>
            );
          })}
        </div>
      </div>

      {/* Head / Prong Style Selection */}
      <div>
        <label className="block text-xs font-semibold tracking-wider uppercase text-white/50 mb-3">
          Setting & Claw Style
        </label>
        <div className="grid grid-cols-2 gap-2">
          {[
            { style: 'SIX_PRONG', label: '6-Claw Round' },
            { style: 'FOUR_PRONG', label: '4-Prong Classic' },
            { style: 'BEZEL', label: 'Modern Bezel' },
            { style: 'HALO', label: 'Pavé Halo' }
          ].map((item) => {
            const isSelected = config.headStyle === item.style;
            return (
              <button
                key={item.style}
                onClick={() => setHeadStyle(item.style as any)}
                className={`py-2 px-3 rounded-xl border text-xs font-medium text-center transition-all ${
                  isSelected
                    ? 'border-gold text-white bg-gold/10'
                    : 'border-white/10 text-white/60 hover:border-white/20'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
