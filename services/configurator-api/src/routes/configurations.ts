import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { RingConfigurationSchema, SaveConfigurationRequestSchema } from '@configurator/contracts';
import { PricingService } from '../services/pricing.service.js';
import { CatalogService } from '../services/catalog.service.js';
import { MedusaAdapter } from '../medusa/medusa.adapter.js';

interface SavedConfigRecord {
  configurationId: string;
  configuration: any;
  authoritativePriceUSD: number;
  previewSnapshotUrl?: string;
  createdAt: string;
}

const savedConfigurationsStore: Map<string, SavedConfigRecord> = new Map();

export const configurationsRoutes: FastifyPluginAsync = async (server: FastifyInstance) => {
  // Validate configuration combination
  server.post('/validate', async (request, reply) => {
    const parseResult = RingConfigurationSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        isValid: false,
        errors: parseResult.error.errors.map(e => `${e.path.join('.')}: ${e.message}`)
      });
    }

    const cfg = parseResult.data;
    const errors: string[] = [];

    // Enforce compatibility rule
    if (cfg.stoneShape === 'EMERALD_CUT' && cfg.headStyle === 'SIX_PRONG') {
      errors.push('Emerald cut gemstones require a 4-prong corner setting, not a 6-claw round setting.');
    }

    if (errors.length > 0) {
      return reply.status(422).send({ isValid: false, errors });
    }

    return { isValid: true };
  });

  // Save configuration and return shareable ID
  server.post('/', async (request, reply) => {
    const parseResult = SaveConfigurationRequestSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        error: 'Invalid save configuration payload',
        details: parseResult.error.flatten()
      });
    }

    const { configuration, previewSnapshotUrl } = parseResult.data;
    const product = CatalogService.getProduct(configuration.productId);
    const priceRes = PricingService.calculate(
      {
        productId: configuration.productId,
        metalType: configuration.metalType,
        metalFinish: configuration.metalFinish,
        stoneShape: configuration.stoneShape,
        caratWeight: configuration.caratWeight,
        headStyle: configuration.headStyle,
        engravingText: configuration.engraving?.text
      },
      product?.baseMetalWeightGrams || 4.5
    );

    const configurationId = 'cfg_' + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
    const record: SavedConfigRecord = {
      configurationId,
      configuration,
      authoritativePriceUSD: priceRes.subtotal,
      previewSnapshotUrl,
      createdAt: new Date().toISOString()
    };

    savedConfigurationsStore.set(configurationId, record);

    const medusaAdapter = new MedusaAdapter();
    const medusaLineItem = medusaAdapter.createCartLineItemPayload(
      configuration,
      priceRes.subtotal,
      'variant_ring_custom_base',
      previewSnapshotUrl,
      configurationId
    );

    return reply.status(201).send({
      configurationId,
      authoritativePrice: priceRes,
      medusaLineItem,
      createdAt: record.createdAt
    });
  });

  // Retrieve saved configuration
  server.get('/:configurationId', async (request, reply) => {
    const { configurationId } = request.params as { configurationId: string };
    const record = savedConfigurationsStore.get(configurationId);
    if (!record) {
      return reply.status(404).send({ error: `Saved configuration '${configurationId}' not found.` });
    }
    return record;
  });
};
