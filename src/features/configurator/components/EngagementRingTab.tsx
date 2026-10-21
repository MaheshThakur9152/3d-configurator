import React from 'react';
import { ConfiguratorState } from '../types/configurator.types';
import {
  SHANK_OPTIONS,
  METAL_OPTIONS,
  SHAPE_OPTIONS,
  CROWN_OPTIONS,
  GEMSTONE_OPTIONS,
  CARAT_OPTIONS,
} from '../data/configuration-options';
import { ShankSelector } from './ShankSelector';
import { MetalSelector } from './MetalSelector';
import { ShapeSelector } from './ShapeSelector';
import { CrownSelector } from './CrownSelector';
import { GemstoneSelector } from './GemstoneSelector';
import { CaratSelector } from './CaratSelector';
import { QualityOriginSelector } from './QualityOriginSelector';
import { RingSizeSelector } from './RingSizeSelector';

interface EngagementRingTabProps {
  state: ConfiguratorState;
  updateState: (updates: Partial<ConfiguratorState>) => void;
}

export const EngagementRingTab: React.FC<EngagementRingTabProps> = ({
  state,
  updateState,
}) => {
  return (
    <div className="flex flex-col">
      <ShankSelector
        options={SHANK_OPTIONS}
        selected={state.selectedShank}
        onSelect={(shank) => updateState({ selectedShank: shank })}
      />

      <MetalSelector
        options={METAL_OPTIONS}
        selected={state.selectedMetal}
        onSelect={(metal) => updateState({ selectedMetal: metal })}
      />

      <ShapeSelector
        options={SHAPE_OPTIONS}
        selected={state.selectedShape}
        onSelect={(shape) => updateState({ selectedShape: shape })}
      />

      <CrownSelector
        options={CROWN_OPTIONS}
        selected={state.selectedCrown}
        onSelect={(crown) => updateState({ selectedCrown: crown })}
      />

      <GemstoneSelector
        label="Centerstone"
        options={GEMSTONE_OPTIONS}
        selected={state.selectedCenterstone}
        onSelect={(gem) => updateState({ selectedCenterstone: gem })}
      />

      <GemstoneSelector
        label="Side Diamond"
        options={GEMSTONE_OPTIONS}
        selected={state.selectedSideDiamond}
        onSelect={(gem) => updateState({ selectedSideDiamond: gem })}
      />

      <CaratSelector
        options={CARAT_OPTIONS}
        selected={state.selectedCarat}
        onSelect={(carat) => updateState({ selectedCarat: carat })}
      />

      <QualityOriginSelector
        quality={state.selectedQuality}
        origin={state.selectedOrigin}
        onQualityChange={(q) => updateState({ selectedQuality: q })}
        onOriginChange={(o) => updateState({ selectedOrigin: o })}
      />

      <RingSizeSelector
        selected={state.selectedRingSize}
        onSelect={(size) => updateState({ selectedRingSize: size })}
      />
    </div>
  );
};
