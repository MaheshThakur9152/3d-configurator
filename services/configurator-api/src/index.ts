import Fastify from 'fastify';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import { productsRoutes } from './routes/products.js';
import { pricingRoutes } from './routes/pricing.js';
import { configurationsRoutes } from './routes/configurations.js';
import { assetsRoutes } from './routes/assets.js';

const server = Fastify({
  logger: {
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug'
  }
});

// Register Plugins
await server.register(cors, {
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
});

await server.register(multipart, {
  limits: {
    fileSize: 30 * 1024 * 1024 // 30 MB
  }
});

// Health check endpoint for Docker & K8s
server.get('/health', async () => {
  return { status: 'healthy', timestamp: new Date().toISOString(), service: 'configurator-api' };
});

// Register API Routes
await server.register(productsRoutes, { prefix: '/api/configurator/products' });
await server.register(pricingRoutes, { prefix: '/api/configurator/pricing' });
await server.register(configurationsRoutes, { prefix: '/api/configurator/configurations' });
await server.register(assetsRoutes, { prefix: '/api/configurator/assets' });

const port = Number(process.env.PORT) || 8080;
const host = process.env.HOST || '0.0.0.0';

const start = async () => {
  try {
    await server.listen({ port, host });
    console.log(`[Configurator API] Server running on http://${host}:${port}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
