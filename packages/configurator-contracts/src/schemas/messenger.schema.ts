import { z } from 'zod';
import { RingConfigurationSchema } from './configuration.schema.js';

export const ViewerReadyEventSchema = z.object({
  type: z.literal('VIEWER_READY'),
  payload: z.object({
    productId: z.string(),
    modelId: z.string(),
    version: z.string()
  })
});

export const ConfigurationChangedEventSchema = z.object({
  type: z.literal('CONFIGURATION_CHANGED'),
  payload: z.object({
    configuration: RingConfigurationSchema,
    estimatedPriceUSD: z.number().nonnegative(),
    previewThumbnailUrl: z.string().optional()
  })
});

export const RequestAddToCartEventSchema = z.object({
  type: z.literal('REQUEST_ADD_TO_CART'),
  payload: z.object({
    configuration: RingConfigurationSchema,
    snapshotDataUrl: z.string().optional()
  })
});

export const SetConfigurationCommandSchema = z.object({
  type: z.literal('SET_CONFIGURATION'),
  payload: RingConfigurationSchema.partial()
});

export const CartActionResultCommandSchema = z.object({
  type: z.literal('CART_ACTION_RESULT'),
  payload: z.object({
    success: z.boolean(),
    cartId: z.string().optional(),
    errorMessage: z.string().optional()
  })
});

export type ViewerReadyEvent = z.infer<typeof ViewerReadyEventSchema>;
export type ConfigurationChangedEvent = z.infer<typeof ConfigurationChangedEventSchema>;
export type RequestAddToCartEvent = z.infer<typeof RequestAddToCartEventSchema>;
export type SetConfigurationCommand = z.infer<typeof SetConfigurationCommandSchema>;
export type CartActionResultCommand = z.infer<typeof CartActionResultCommandSchema>;
