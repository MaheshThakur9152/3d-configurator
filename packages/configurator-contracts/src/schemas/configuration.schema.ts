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

export const HeadStyleSchema = z.enum([
  'FOUR_PRONG',
  'SIX_PRONG',
  'BEZEL',
  'HALO'
]);

export const EngravingSchema = z.object({
  text: z.string().max(25, 'Engraving text maximum 25 characters').trim().optional(),
  font: z.enum(['PlayfairDisplay', 'Archivo', 'QwitcherGrypen']).default('PlayfairDisplay')
});

export const RingConfigurationSchema = z.object({
  schemaVersion: z.literal('1.0.0').default('1.0.0'),
  productId: z.string().min(1, 'Product ID is required'),
  productSlug: z.string().min(1, 'Product slug is required'),
  modelId: z.string().min(1, 'Model ID is required'),
  
  metalType: MetalTypeSchema.default('18K_YELLOW_GOLD'),
  metalFinish: MetalFinishSchema.default('HIGH_POLISH'),
  fingerSizeUS: z.number().min(3.0).max(14.0).default(6.5),
  
  gemstoneType: GemstoneTypeSchema.default('DIAMOND_WHITE'),
  stoneShape: StoneShapeSchema.default('ROUND_BRILLIANT'),
  caratWeight: z.number().min(0.3).max(5.0).default(1.0),
  
  settingMetalType: MetalTypeSchema.default('18K_WHITE_GOLD'),
  headStyle: HeadStyleSchema.default('SIX_PRONG'),
  
  engraving: EngravingSchema.optional(),
  timestamp: z.string().optional()
});

export type RingConfiguration = z.infer<typeof RingConfigurationSchema>;
