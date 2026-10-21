import React from 'react';
import { ShankOption } from '../../types/configurator';

interface ShankSelectorProps {
  options: ShankOption[];
  selected: ShankOption;
  onSelect: (option: ShankOption) => void;
}

export const ShankSelector: React.FC<ShankSelectorProps> = ({
  options,
  selected,
  onSelect,
}) => {
  return (
    <div className="mb-6">
      {/* Section Header */}
      <div className="flex items-center gap-1.5 w-full pt-1 pb-2 flex-wrap">
        <span
          className="text-[14px] font-[400] font-sans"
          style={{ color: 'var(--config-text-primary)' }}
        >
          Ring:
        </span>
        <span
          className="text-[14px] font-[300] font-sans"
          style={{ color: 'var(--config-text-secondary)' }}
        >
          {selected.name}
        </span>
      </div>

      {/* Thumbnails Grid (7 columns desktop, 6 mobile, 3 tablet) */}
      <div className="grid grid-cols-6 sm:grid-cols-7 gap-2">
        {options.map((option) => {
          const isSelected = option.id === selected.id;
          return (
            <div
              key={option.id}
              className="relative group hover-indicator flex items-center justify-center cursor-pointer"
              onClick={() => onSelect(option)}
            >
              <div
                className={`w-[44px] h-[44px] rounded-full flex items-center justify-center transition-all duration-200 ${
                  isSelected
                    ? 'border-[1.5px] border-black p-0.5'
                    : 'border border-transparent hover:border-gray-300'
                }`}
              >
                <img
                  src={option.thumbnail}
                  alt={option.name}
                  className="w-full h-full object-contain p-1"
                />
              </div>

              {/* Tooltip on Hover */}
              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2.5 py-1 bg-gray-900 text-white text-[10px] tracking-wide whitespace-nowrap rounded font-semibold shadow-xl opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 pointer-events-none z-50 uppercase">
                {option.name}
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-x-[4px] border-x-transparent border-t-[4px] border-t-gray-900" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
