import React from 'react';
import { useConfiguratorStore } from '../../store/useConfiguratorStore.js';

export const CaratSlider: React.FC = () => {
  const { config, setCaratWeight } = useConfiguratorStore();

  // Approximate physical dimensions for a round brilliant cut
  const diameterMm = (6.5 * Math.cbrt(config.caratWeight)).toFixed(2);
  const depthMm = (parseFloat(diameterMm) * 0.61).toFixed(2);

  return (
    <div className="space-y-6">
      <div>
        <div className="flex justify-between items-baseline mb-2">
          <label className="text-xs font-semibold tracking-wider uppercase text-white/50">
            Center Stone Carat Weight
          </label>
          <span className="text-sm font-bold text-gold font-mono">
            {config.caratWeight.toFixed(2)} ct
          </span>
        </div>

        <input
          type="range"
          min="0.5"
          max="3.0"
          step="0.05"
          value={config.caratWeight}
          onChange={(e) => setCaratWeight(parseFloat(e.target.value))}
          className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#E2BF7F]"
        />

        <div className="flex justify-between text-[10px] text-white/40 mt-1">
          <span>0.50 ct</span>
          <span>1.00 ct</span>
          <span>1.50 ct</span>
          <span>2.00 ct</span>
          <span>3.00 ct</span>
        </div>
      </div>

      {/* Physical Millimeter Specification Box */}
      <div className="p-3.5 rounded-xl border border-white/10 bg-white/[0.03]">
        <h4 className="text-[11px] font-semibold uppercase tracking-wider text-white/60 mb-2">
          Estimated Physical Dimensions
        </h4>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-white/40">Girdle Diameter:</span>
            <p className="font-mono text-white font-medium">{diameterMm} mm</p>
          </div>
          <div>
            <span className="text-white/40">Total Depth:</span>
            <p className="font-mono text-white font-medium">{depthMm} mm</p>
          </div>
        </div>
      </div>
    </div>
  );
};
