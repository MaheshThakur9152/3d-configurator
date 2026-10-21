import React from 'react';
import { QUALITY_OPTIONS, ORIGIN_OPTIONS } from '../../data/configuratorData';

interface QualityOriginSelectorProps {
  quality: string;
  origin: string;
  onQualityChange: (quality: string) => void;
  onOriginChange: (origin: string) => void;
}

export const QualityOriginSelector: React.FC<QualityOriginSelectorProps> = ({
  quality,
  origin,
  onQualityChange,
  onOriginChange,
}) => {
  const currentQualityLabel =
    QUALITY_OPTIONS.find((q) => q.id === quality)?.label || quality;
  const currentOriginLabel =
    ORIGIN_OPTIONS.find((o) => o.id === origin)?.label || origin;

  return (
    <div className="mb-6">
      <div className="flex items-center gap-1.5 w-full pt-1 pb-2 flex-wrap">
        <span
          className="text-[14px] font-[400] font-sans"
          style={{ color: 'var(--config-text-primary)' }}
        >
          Quality &amp; Diamond Origin:
        </span>
        <span
          className="text-[14px] font-[300] font-sans"
          style={{ color: 'var(--config-text-secondary)' }}
        >
          {currentQualityLabel}; {currentOriginLabel}
        </span>
      </div>

      <div className="flex items-center gap-3">
        {/* Quality Dropdown */}
        <div className="flex-1">
          <div className="relative">
            <select
              value={quality}
              onChange={(e) => onQualityChange(e.target.value)}
              className="w-full px-4 py-2 bg-white border border-gray-200 text-[14px] text-gray-700 cursor-pointer appearance-none hover:border-gray-300 transition-colors focus:outline-none rounded-none"
            >
              {QUALITY_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
              <svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="1">
                <path d="M1 1L5 5L9 1" />
              </svg>
            </div>
          </div>
        </div>

        {/* Origin Dropdown */}
        <div className="flex-1">
          <div className="relative">
            <select
              value={origin}
              onChange={(e) => onOriginChange(e.target.value)}
              className="w-full px-4 py-2 bg-white border border-gray-200 text-[14px] text-gray-700 cursor-pointer appearance-none hover:border-gray-300 transition-colors focus:outline-none rounded-none"
            >
              {ORIGIN_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
              <svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="1">
                <path d="M1 1L5 5L9 1" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
