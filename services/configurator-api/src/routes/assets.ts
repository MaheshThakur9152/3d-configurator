import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { AssetValidatorService } from '../services/asset-validator.service.js';
import { CatalogService } from '../services/catalog.service.js';
import { ProductManifest } from '@configurator/contracts';

export const assetsRoutes: FastifyPluginAsync = async (server: FastifyInstance) => {
  server.post('/upload', async (request, reply) => {
    // For fastify-multipart or binary payload
    let buffer: Buffer | null = null;
    let title = 'Custom Uploaded Ring';
    let productSlug = 'custom-ring-' + Date.now();

    if (request.isMultipart()) {
      const data = await request.file();
      if (!data) {
        return reply.status(400).send({ error: 'No file received in multipart upload' });
      }
      buffer = await data.toBuffer();
    } else {
      buffer = request.body as Buffer;
    }

    if (!buffer || buffer.length === 0) {
      return reply.status(400).send({ error: 'Empty file payload received' });
    }

    const validation = AssetValidatorService.validate(buffer);
    if (!validation.isValid) {
      return reply.status(422).send({
        success: false,
        message: 'GLB model failed validation',
        validation
      });
    }

    // Auto-generate manifest
    const modelId = 'model_upload_' + Date.now().toString(36);
    const manifest: ProductManifest = {
      schemaVersion: '1.0.0',
      modelId,
      productSlug,
      title,
      assetUrl: `/models/uploads/${modelId}.glb`,
      basePriceUSD: 1100.00,
      baseMetalWeightGrams: 5.0,
      componentMappings: {
        Shank: {
          nodeName: validation.metadata.suggestedMappings['Shank'] || validation.metadata.detectedNodeNames[0] || 'Shank',
          defaultMaterialId: 'metal.pbr.v1',
          defaultPreset: '18K_YELLOW_POLISHED'
        },
        CenterStone: {
          nodeName: validation.metadata.suggestedMappings['CenterStone'] || validation.metadata.detectedNodeNames[1] || 'Diamond',
          defaultMaterialId: 'diamond.refraction.v1',
          defaultPreset: 'DIAMOND_WHITE',
          caratWeight: 1.0,
          cutShape: 'ROUND_BRILLIANT'
        }
      },
      allowedOptions: {
        metals: ['18K_YELLOW_GOLD', '18K_WHITE_GOLD', '18K_ROSE_GOLD', 'PLATINUM_950'],
        stoneShapes: ['ROUND_BRILLIANT', 'OVAL', 'CUSHION'],
        gemstones: ['DIAMOND_WHITE', 'DIAMOND_YELLOW', 'RUBY', 'SAPPHIRE', 'EMERALD'],
        headStyles: ['SIX_PRONG', 'FOUR_PRONG'],
        caratRange: { min: 0.5, max: 3.0, step: 0.1 }
      }
    };

    CatalogService.addProduct(manifest);

    return reply.status(201).send({
      success: true,
      message: 'GLB asset validated and registered into product catalog successfully',
      manifest,
      validationReport: validation
    });
  });
};
