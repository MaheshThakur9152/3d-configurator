import { z } from 'zod';
import { RingConfigurationSchema } from './configuration.schema.js';

export const PricingCalculateRequestSchema = z.object({
  productId: z.string().min(1),
  metalType: z.string(),
  metalFinish: z.string(),
  stoneShape: z.string(),
  caratWeight: z.number().positive(),
  headStyle: z.string(),
  engravingText: z.string().optional()
});

export const SaveConfigurationRequestSchema = z.object({
  configuration: RingConfigurationSchema,
  previewSnapshotUrl: z.string().optional()
});

export const AssetUploadMetadataSchema = z.object({
  title: z.string().min(1),
  productSlug: z.string().min(1),
  baseMetalWeightGrams: z.number().positive().default(4.5),
  basePriceUSD: z.number().nonnegative().default(900.0)
});

export type PricingCalculateRequest = z.infer<typeof PricingCalculateRequestSchema>;
export type SaveConfigurationRequest = z.infer<typeof SaveConfigurationRequestSchema>;
export type AssetUploadMetadata = z.infer<typeof AssetUploadMetadataSchema>;
