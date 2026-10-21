import React from 'react';
import { GemstoneOption } from '../../types/configurator';

interface GemstoneSelectorProps {
  label: string;
  options: GemstoneOption[];
  selected: GemstoneOption;
  onSelect: (option: GemstoneOption) => void;
}

export const GemstoneSelector: React.FC<GemstoneSelectorProps> = ({
  label,
  options,
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
          {label}:
        </span>
        <span
          className="text-[14px] font-[300] font-sans"
          style={{ color: 'var(--config-text-secondary)' }}
        >
          {selected.name}
        </span>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {options.map((option) => {
          const isSelected = option.id === selected.id;
          return (
            <div
              key={option.id}
              className="relative group hover-indicator cursor-pointer"
              style={{ width: '38px', height: '38px' }}
              onClick={() => onSelect(option)}
            >
              <div
                className={`w-[36px] h-[36px] rounded-full flex items-center justify-center transition-all duration-200 ${
                  isSelected
                    ? 'border-[1.5px] border-black p-0.5'
                    : 'border border-transparent hover:border-gray-300 p-0.5'
                }`}
              >
                <img
                  src={option.icon}
                  alt={option.name}
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Tooltip on hover */}
              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2.5 py-1 bg-gray-950 text-white text-[10px] tracking-wide whitespace-nowrap rounded font-bold shadow-2xl opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 pointer-events-none z-50 uppercase">
                {option.name}
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-x-[4px] border-x-transparent border-t-[4px] border-t-gray-950" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
