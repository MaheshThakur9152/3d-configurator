import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { PricingService } from '../src/services/pricing.service.js';
import { CatalogService } from '../src/services/catalog.service.js';
import { AssetValidatorService } from '../src/services/asset-validator.service.js';
import { RingConfigurationSchema } from '@configurator/contracts';

test('PricingService calculates accurate price breakdown', () => {
  const req = {
    productId: 'solitaire-01',
    metalType: '18K_ROSE_GOLD',
    metalFinish: 'HIGH_POLISH',
    stoneShape: 'ROUND_BRILLIANT',
    caratWeight: 1.0,
    headStyle: 'SIX_PRONG',
    engravingText: 'Love Always'
  };

  const result = PricingService.calculate(req, 4.5);
  assert.strictEqual(result.currency, 'USD');
  assert.strictEqual(result.breakdown.settingLabor, 180.00);
  assert.strictEqual(result.breakdown.stoneCost, 1850.00);
  assert.strictEqual(result.breakdown.engravingFee, 40.00);
  assert.ok(result.subtotal > 2000.00);
});

test('CatalogService returns valid product manifests', () => {
  const solitaire = CatalogService.getProduct('solitaire-01');
  assert.ok(solitaire !== undefined);
  assert.strictEqual(solitaire?.modelId, 'solitaire_cathedral_01');
  assert.ok(solitaire?.componentMappings.Shank.nodeName === 'gold');
  assert.ok(solitaire?.componentMappings.Setting.nodeName === 'silver');

  const halo = CatalogService.getProduct('halo-02');
  assert.ok(halo !== undefined);
  assert.strictEqual(halo?.modelId, 'halo_pave_02');
  assert.ok(halo?.componentMappings.Shank.nodeName === 'alliance');
});

test('RingConfigurationSchema validates compliant configurations', () => {
  const validConfig = {
    productId: 'solitaire-01',
    productSlug: 'the-eternal-cathedral-solitaire',
    modelId: 'solitaire_cathedral_01',
    metalType: '18K_YELLOW_GOLD',
    metalFinish: 'HIGH_POLISH',
    fingerSizeUS: 6.5,
    gemstoneType: 'DIAMOND_WHITE',
    stoneShape: 'ROUND_BRILLIANT',
    caratWeight: 1.5,
    settingMetalType: 'PLATINUM_950',
    headStyle: 'SIX_PRONG'
  };

  const parseRes = RingConfigurationSchema.safeParse(validConfig);
  assert.ok(parseRes.success);
});

test('AssetValidatorService successfully inspects real GLB binary', () => {
  const glbPath = path.resolve('D:/3D-app/Crystal-Jewels/assets/ring_webgi.glb');
  if (fs.existsSync(glbPath)) {
    const buffer = fs.readFileSync(glbPath);
    const result = AssetValidatorService.validate(buffer);
    assert.strictEqual(result.isValid, true);
    assert.strictEqual(result.errors.length, 0);
    assert.ok(result.metadata.nodeCount >= 8);
    assert.ok(result.metadata.meshCount >= 8);
  }
});
