import { RingConfiguration } from '@configurator/contracts';

export interface MedusaLineItemPayload {
  variant_id: string;
  quantity: number;
  metadata: {
    configurator: {
      configurationId?: string;
      modelId: string;
      metalType: string;
      metalFinish: string;
      fingerSizeUS: number;
      gemstoneType: string;
      stoneShape: string;
      caratWeight: number;
      settingMetalType: string;
      headStyle: string;
      engravingText?: string;
      engravingFont?: string;
      authoritativePriceUSD: number;
      snapshotImageUrl?: string;
      manufacturingSpec: {
        cadModelId: string;
        stoneDimensionsMm: {
          diameter: number;
          depth: number;
        };
      };
    };
  };
}

export class MedusaAdapter {
  private medusaUrl: string;
  private apiKey?: string;

  constructor(medusaUrl: string = 'http://localhost:9000', apiKey?: string) {
    this.medusaUrl = medusaUrl;
    this.apiKey = apiKey;
  }

  public createCartLineItemPayload(
    config: RingConfiguration,
    authoritativePriceUSD: number,
    baseVariantId: string = 'variant_custom_ring_base',
    snapshotImageUrl?: string,
    configurationId?: string
  ): MedusaLineItemPayload {
    // Calculate approximate diamond physical millimeter dimensions based on carat weight
    const diameterMm = Math.round(6.5 * Math.cbrt(config.caratWeight) * 100) / 100;
    const depthMm = Math.round(diameterMm * 0.61 * 100) / 100;

    return {
      variant_id: baseVariantId,
      quantity: 1,
      metadata: {
        configurator: {
          configurationId,
          modelId: config.modelId,
          metalType: config.metalType,
          metalFinish: config.metalFinish,
          fingerSizeUS: config.fingerSizeUS,
          gemstoneType: config.gemstoneType,
          stoneShape: config.stoneShape,
          caratWeight: config.caratWeight,
          settingMetalType: config.settingMetalType,
          headStyle: config.headStyle,
          engravingText: config.engraving?.text,
          engravingFont: config.engraving?.font,
          authoritativePriceUSD,
          snapshotImageUrl,
          manufacturingSpec: {
            cadModelId: `${config.modelId}_${config.stoneShape}_${config.caratWeight}CT`,
            stoneDimensionsMm: {
              diameter: diameterMm,
              depth: depthMm
            }
          }
        }
      }
    };
  }

  public async addToCart(cartId: string, payload: MedusaLineItemPayload): Promise<{ success: boolean; cart?: any; error?: string }> {
    try {
      const response = await fetch(`${this.medusaUrl}/store/carts/${cartId}/line-items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey ? { 'x-medusa-access-token': this.apiKey } : {})
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        return { success: false, error: `Medusa cart error (${response.status}): ${errorText}` };
      }

      const data = await response.json();
      return { success: true, cart: data.cart };
    } catch (e: any) {
      return { success: false, error: `Failed to connect to Medusa backend at ${this.medusaUrl}: ${e.message}` };
    }
  }
}
