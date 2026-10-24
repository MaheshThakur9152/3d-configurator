# 05 - Configuration Data Model and Validation Engine

## 1. Executive Summary

This document specifies the data model, validation rules, and state management engine for the 3D jewellery configurator.

In the legacy Crystal Jewels prototype, state was unmanaged and held in five loose module variables (`ringModel`, `usingCustomColors`, `nightMode`, `musicPlay`, `firstLooad`). Changing rings wiped custom colors, and zero validation existed.

The production configuration engine introduces:
1. **Typed Zod Schemas**: A formal contract (`@configurator/contracts`) shared across the frontend and backend.
2. **Compatibility Rules Engine**: Enforces physically and geometrically valid combinations (e.g., preventing an emerald-cut stone from mounting into a round-brilliant head).
3. **Reactive State Store**: A Zustand store providing unidirectional data flow, bidirectional URL hash synchronization, and undo/redo history.

---

## 2. Configuration Data Schema (Zod Definition)

```typescript
import { z } from 'zod';

export const MetalTypeSchema = z.enum([
  '18K_YELLOW_GOLD',
  '18K_WHITE_GOLD',
  '18K_ROSE_GOLD',
  'PLATINUM_950'
]);

export const MetalFinishSchema = z.enum([
  'HIGH_POLISH',
  'SATIN_BRUSHED'
]);

export const StoneShapeSchema = z.enum([
  'ROUND_BRILLIANT',
  'OVAL',
  'EMERALD_CUT',
  'PEAR',
  'CUSHION',
  'PRINCESS'
]);

export const GemstoneTypeSchema = z.enum([
  'DIAMOND_WHITE',
  'DIAMOND_YELLOW',
  'DIAMOND_PINK',
  'DIAMOND_BLUE',
  'RUBY',
  'SAPPHIRE',
  'EMERALD'
]);

export const EngravingSchema = z.object({
  text: z.string().max(25, 'Engraving text cannot exceed 25 characters').trim().optional(),
  font: z.enum(['PlayfairDisplay', 'Archivo', 'QwitcherGrypen']).default('PlayfairDisplay')
});

export const RingConfigurationSchema = z.object({
  schemaVersion: z.literal('1.0.0'),
  productId: z.string().min(1),
  productSlug: z.string().min(1),
  modelId: z.string().min(1),
  
  // Band & Shank Options
  metalType: MetalTypeSchema.default('18K_YELLOW_GOLD'),
  metalFinish: MetalFinishSchema.default('HIGH_POLISH'),
  fingerSizeUS: z.number().min(3.0).max(14.0).step(0.25).default(6.5),
  
  // Center Gemstone Options
  gemstoneType: GemstoneTypeSchema.default('DIAMOND_WHITE'),
  stoneShape: StoneShapeSchema.default('ROUND_BRILLIANT'),
  caratWeight: z.number().min(0.3).max(5.0).step(0.05).default(1.0),
  
  // Setting & Head Options
  settingMetalType: MetalTypeSchema.default('18K_WHITE_GOLD'),
  headStyle: z.enum(['FOUR_PRONG', 'SIX_PRONG', 'BEZEL', 'HALO']).default('SIX_PRONG'),
  
  // Customization Extras
  engraving: EngravingSchema.optional(),
  
  // Metadata & Timestamps
  timestamp: z.string().datetime().optional()
});

export type RingConfiguration = z.infer<typeof RingConfigurationSchema>;
```

---

## 3. Product Compatibility Rules Matrix

Not every gemstone cut can fit into every head, and not every metal supports satin finishing. The compatibility engine evaluates incoming configurations against a declarative ruleset:

```typescript
export interface CompatibilityRule {
  id: string;
  description: string;
  evaluate(config: Partial<RingConfiguration>): { isValid: boolean; reason?: string };
}

export const COMPATIBILITY_RULES: CompatibilityRule[] = [
  {
    id: 'EMERALD_CUT_PRONG_CONSTRAINT',
    description: 'Emerald cut diamonds require a 4-corner prong head or bezel, not a 6-claw round head.',
    evaluate: (cfg) => {
      if (cfg.stoneShape === 'EMERALD_CUT' && cfg.headStyle === 'SIX_PRONG') {
        return { isValid: false, reason: 'Emerald cut gemstones require a 4-prong corner setting.' };
      }
      return { isValid: true };
    }
  },
  {
    id: 'CARAT_WEIGHT_PRONG_SPAN',
    description: 'Carat weights exceeding 3.0ct require reinforced heavy prongs.',
    evaluate: (cfg) => {
      if (cfg.caratWeight && cfg.caratWeight > 3.0 && cfg.headStyle === 'BEZEL') {
        return { isValid: false, reason: 'Bezel settings currently support stones up to 3.0 carats.' };
      }
      return { isValid: true };
    }
  },
  {
    id: 'TWO_TONE_METAL_ALLOWANCE',
    description: 'Two-tone setting metals must be platinum or white gold for white diamonds to prevent color bleed.',
    evaluate: (cfg) => {
      if (cfg.gemstoneType === 'DIAMOND_WHITE' && cfg.settingMetalType === '18K_ROSE_GOLD') {
        return { isValid: true }; // Allowed, but triggers visual warm-reflection advisory
      }
      return { isValid: true };
    }
  }
];
```

---

## 4. State Transitions: Differentiating Updates

The renderer inspects state changes to apply the lowest-cost operation:

```
[User Action]
     │
     ├── 1. Metal Color / Finish Change ────────► Material-Only Uniform Update (0 ms)
     │                                            (No mesh replacement; updates .color / .roughness)
     │
     ├── 2. Gemstone Tint / IOR Change ─────────► Gemstone Shader Uniform Update (0 ms)
     │                                            (Updates Beer-Lambert color / dispersion delta)
     │
     ├── 3. Carat Weight Slider ────────────────► Morph Target / Scale Key Interpolation (16 ms)
     │                                            (Interpolates stone vertex positions & prongs)
     │
     ├── 4. Stone Shape Selection (Round->Oval) ─► Swap CenterStone Geometry Node (50 ms)
     │                                            (Replaces gemstone mesh buffer; preserves ring)
     │
     └── 5. Switch Ring Style (Solitaire->Halo) ─► Clean Disposal + Load Alternate Model (500 ms)
                                                  (Properly disposes VRAM before mounting new GLB)
```

---

## 5. Zustand Reactive Store (`apps/configurator/src/store`)

The configuration state is managed via a typed Zustand store with automatic URL synchronization:

```typescript
import { create } from 'zustand';
import { RingConfiguration, RingConfigurationSchema } from '@configurator/contracts';

interface ConfiguratorStore {
  config: RingConfiguration;
  isDirty: boolean;
  activeTab: 'metals' | 'gemstones' | 'setting' | 'engraving';
  
  // Actions
  setMetalType: (metal: RingConfiguration['metalType']) => void;
  setMetalFinish: (finish: RingConfiguration['metalFinish']) => void;
  setStoneShape: (shape: RingConfiguration['stoneShape']) => void;
  setCaratWeight: (carat: number) => void;
  setGemstoneType: (gem: RingConfiguration['gemstoneType']) => void;
  setFingerSize: (size: number) => void;
  setEngravingText: (text: string) => void;
  resetDefaults: () => void;
  loadConfiguration: (config: RingConfiguration) => void;
}
```
- **URL Synchronization**: Any change serializes the configuration into a Base64-encoded URL hash parameter (`#cfg=eyJhbGci...`). Customers can copy the browser URL to instantly share their customized ring.
- **Undo/Redo**: Zustand temporal middleware tracks historical states, allowing customers to easily step back through their design changes.
