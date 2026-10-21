import React from 'react';
import { RING_SIZES } from '../../data/configuratorData';

interface RingSizeSelectorProps {
  selected: string;
  onSelect: (size: string) => void;
}

export const RingSizeSelector: React.FC<RingSizeSelectorProps> = ({
  selected,
  onSelect,
}) => {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-1.5 w-full pt-1 pb-2 flex-wrap">
        <span
          className="text-[14px] font-[400] font-sans"
          style={{ color: 'var(--config-text-primary)' }}
        >
          Ring Size:
        </span>
        <span
          className="text-[14px] font-[300] font-sans"
          style={{ color: 'var(--config-text-secondary)' }}
        >
          {selected}
        </span>
      </div>

      <div className="flex items-center gap-4 flex-wrap pt-1">
        {RING_SIZES.map((size) => {
          const isSelected = size === selected;
          return (
            <div key={size} className="relative pb-1">
              <button
                type="button"
                onClick={() => onSelect(size)}
                className={`text-[12px] font-sans cursor-pointer transition-colors ${
                  isSelected ? 'text-gray-900 font-medium' : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                {size}
              </button>
              {isSelected && (
                <div className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-[#000000]" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
