import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { PricingCalculateRequestSchema } from '@configurator/contracts';
import { PricingService } from '../services/pricing.service.js';
import { CatalogService } from '../services/catalog.service.js';

export const pricingRoutes: FastifyPluginAsync = async (server: FastifyInstance) => {
  server.post('/calculate', async (request, reply) => {
    const parseResult = PricingCalculateRequestSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        error: 'Invalid pricing calculation parameters',
        details: parseResult.error.flatten()
      });
    }

    const payload = parseResult.data;
    const product = CatalogService.getProduct(payload.productId);
    const metalWeight = product?.baseMetalWeightGrams || 4.5;

    const price = PricingService.calculate(payload, metalWeight);
    return price;
  });
};
