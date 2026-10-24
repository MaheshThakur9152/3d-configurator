import { ProductManifest } from '@configurator/contracts';

export class CatalogService {
  private static products: Map<string, ProductManifest> = new Map();

  static {
    // 1. Solitaire Cathedral Ring (ring_webgi.glb)
    this.products.set('solitaire-01', {
      schemaVersion: '1.0.0',
      modelId: 'solitaire_cathedral_01',
      productSlug: 'the-eternal-cathedral-solitaire',
      title: 'The Eternal Cathedral Solitaire Ring',
      assetUrl: '/models/ring_webgi.glb',
      basePriceUSD: 850.00,
      baseMetalWeightGrams: 4.5,
      componentMappings: {
        Shank: {
          nodeName: 'gold',
          defaultMaterialId: 'metal.pbr.v1',
          defaultPreset: '18K_YELLOW_POLISHED'
        },
        Setting: {
          nodeName: 'silver',
          defaultMaterialId: 'metal.pbr.v1',
          defaultPreset: '18K_WHITE_POLISHED'
        },
        CenterStone: {
          nodeName: 'diamonds',
          defaultMaterialId: 'diamond.refraction.v1',
          defaultPreset: 'DIAMOND_WHITE',
          caratWeight: 1.0,
          cutShape: 'ROUND_BRILLIANT'
        }
      },
      allowedOptions: {
        metals: ['18K_YELLOW_GOLD', '18K_WHITE_GOLD', '18K_ROSE_GOLD', 'PLATINUM_950'],
        stoneShapes: ['ROUND_BRILLIANT', 'OVAL', 'EMERALD_CUT', 'PEAR', 'CUSHION', 'PRINCESS'],
        gemstones: ['DIAMOND_WHITE', 'DIAMOND_YELLOW', 'DIAMOND_PINK', 'DIAMOND_BLUE', 'RUBY', 'SAPPHIRE', 'EMERALD'],
        headStyles: ['FOUR_PRONG', 'SIX_PRONG', 'BEZEL'],
        caratRange: { min: 0.5, max: 3.0, step: 0.1 }
      }
    });

    // 2. Halo Pavé Ring (ring2_webgi.glb)
    this.products.set('halo-02', {
      schemaVersion: '1.0.0',
      modelId: 'halo_pave_02',
      productSlug: 'the-luminary-halo-pave',
      title: 'The Luminary Halo & Pavé Ring',
      assetUrl: '/models/ring2_webgi.glb',
      basePriceUSD: 1450.00,
      baseMetalWeightGrams: 6.8,
      componentMappings: {
        Shank: {
          nodeName: 'alliance',
          defaultMaterialId: 'metal.pbr.v1',
          defaultPreset: '18K_WHITE_POLISHED'
        },
        Setting: {
          nodeName: 'entourage',
          defaultMaterialId: 'metal.pbr.v1',
          defaultPreset: '18K_WHITE_POLISHED'
        },
        CenterStone: {
          nodeName: 'Object',
          defaultMaterialId: 'diamond.refraction.v1',
          defaultPreset: 'DIAMOND_WHITE',
          caratWeight: 1.5,
          cutShape: 'CUSHION'
        },
        SideStones: {
          nodeName: 'diamond_side_cuchion_001',
          defaultMaterialId: 'diamond.refraction.v1',
          defaultPreset: 'DIAMOND_WHITE'
        },
        PaveStones: {
          nodeName: 'dia001',
          defaultMaterialId: 'diamond.refraction.v1',
          defaultPreset: 'DIAMOND_WHITE'
        }
      },
      allowedOptions: {
        metals: ['18K_YELLOW_GOLD', '18K_WHITE_GOLD', '18K_ROSE_GOLD', 'PLATINUM_950'],
        stoneShapes: ['CUSHION', 'ROUND_BRILLIANT', 'OVAL'],
        gemstones: ['DIAMOND_WHITE', 'DIAMOND_YELLOW', 'DIAMOND_PINK', 'RUBY', 'SAPPHIRE', 'EMERALD'],
        headStyles: ['HALO', 'FOUR_PRONG'],
        caratRange: { min: 1.0, max: 4.0, step: 0.25 }
      }
    });
  }

  public static getProduct(idOrSlug: string): ProductManifest | undefined {
    return this.products.get(idOrSlug) || Array.from(this.products.values()).find(p => p.productSlug === idOrSlug);
  }

  public static listProducts(): ProductManifest[] {
    return Array.from(this.products.values());
  }

  public static addProduct(manifest: ProductManifest): void {
    this.products.set(manifest.modelId, manifest);
  }
}
