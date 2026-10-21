import React from 'react';
import { ShapeOption } from '../../types/configurator';

interface ShapeSelectorProps {
  options: ShapeOption[];
  selected: ShapeOption;
  onSelect: (option: ShapeOption) => void;
}

export const ShapeSelector: React.FC<ShapeSelectorProps> = ({
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
          Shape:
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
              style={{ width: '46px', height: '46px' }}
              onClick={() => onSelect(option)}
            >
              <div
                className="flex items-center justify-center relative transition-all duration-300"
                style={{ width: '46px', height: '46px' }}
              >
                <button
                  type="button"
                  className="transition-all duration-300 flex items-center justify-center overflow-hidden relative cursor-pointer rounded-[3px] bg-transparent border border-transparent"
                  style={{ width: '42px', height: '42px' }}
                >
                  <img
                    alt={option.name}
                    className="w-full h-full object-contain transition-transform duration-300 p-1 opacity-80 group-hover:opacity-100"
                    src={option.icon}
                  />
                </button>
              </div>

              {/* Active bottom underline indicator */}
              {isSelected && (
                <div className="absolute bottom-0 left-[20%] right-[20%] h-[1.5px] bg-[#000000]" />
              )}

              {/* Tooltip on hover */}
              <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-gray-950 text-white text-[10px] tracking-wide whitespace-nowrap rounded font-bold shadow-2xl opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 pointer-events-none z-50 uppercase">
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
