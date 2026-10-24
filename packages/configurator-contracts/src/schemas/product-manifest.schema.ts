import { z } from 'zod';
import { MetalTypeSchema, StoneShapeSchema, GemstoneTypeSchema, HeadStyleSchema } from './configuration.schema.js';

export const ComponentMappingSchema = z.object({
  nodeName: z.string().min(1, 'Target node name is required'),
  defaultMaterialId: z.enum(['metal.pbr.v1', 'diamond.refraction.v1', 'diamond.custom.v1']),
  defaultPreset: z.string(),
  morphTargets: z.record(z.string()).optional(),
  caratWeight: z.number().optional(),
  cutShape: StoneShapeSchema.optional()
});

export const ProductManifestSchema = z.object({
  schemaVersion: z.literal('1.0.0').default('1.0.0'),
  modelId: z.string().min(1),
  productSlug: z.string().min(1),
  title: z.string().min(1),
  assetUrl: z.string().min(1),
  checksum: z.string().optional(),
  basePriceUSD: z.number().nonnegative(),
  baseMetalWeightGrams: z.number().positive(),
  componentMappings: z.record(ComponentMappingSchema),
  allowedOptions: z.object({
    metals: z.array(MetalTypeSchema),
    stoneShapes: z.array(StoneShapeSchema),
    gemstones: z.array(GemstoneTypeSchema),
    headStyles: z.array(HeadStyleSchema),
    caratRange: z.object({
      min: z.number(),
      max: z.number(),
      step: z.number()
    })
  })
});

export type ComponentMapping = z.infer<typeof ComponentMappingSchema>;
export type ProductManifest = z.infer<typeof ProductManifestSchema>;
