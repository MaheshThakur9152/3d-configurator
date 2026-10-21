import React from 'react';
import { MetalOption } from '../../types/configurator';

interface MetalSelectorProps {
  options: MetalOption[];
  selected: MetalOption;
  onSelect: (option: MetalOption) => void;
}

export const MetalSelector: React.FC<MetalSelectorProps> = ({
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
          Metal:
        </span>
        <span
          className="text-[14px] font-[300] font-sans"
          style={{ color: 'var(--config-text-secondary)' }}
        >
          {selected.name}
        </span>
      </div>

      <div className="flex items-center gap-3">
        {options.map((option) => {
          const isSelected = option.id === selected.id;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onSelect(option)}
              className={`relative rounded-full transition-all duration-200 cursor-pointer flex items-center justify-center ${
                isSelected
                  ? 'border-[1.5px] border-black p-0.5'
                  : 'border border-transparent p-0.5 hover:opacity-80'
              }`}
              style={{ width: '38px', height: '38px' }}
              title={option.name}
            >
              <img
                src={option.icon}
                alt={option.name}
                className="w-full h-full object-contain rounded-full"
              />
            </button>
          );
        })}
      </div>
    </div>
  );
};
