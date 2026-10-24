import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { CatalogService } from '../services/catalog.service.js';

export const productsRoutes: FastPluginAsync = async (server: FastifyInstance) => {
  server.get('/', async (request, reply) => {
    return CatalogService.listProducts();
  });

  server.get('/:productId', async (request, reply) => {
    const { productId } = request.params as { productId: string };
    const product = CatalogService.getProduct(productId);
    if (!product) {
      return reply.status(404).send({ error: `Product '${productId}' not found in configurator catalog.` });
    }
    return product;
  });
};

type FastPluginAsync = FastPlugin;
type FastPlugin = FastifyPluginAsync;
