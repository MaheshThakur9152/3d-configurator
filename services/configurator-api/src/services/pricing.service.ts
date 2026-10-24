import { AuthoritativePriceResponse, PriceBreakdown, PricingCalculateRequest } from '@configurator/contracts';

export class PricingService {
  private static metalSpotPricesUSDPerGram: Record<string, number> = {
    '18K_YELLOW_GOLD': 58.50,
    '18K_WHITE_GOLD': 61.20,
    '18K_ROSE_GOLD': 59.10,
    'PLATINUM_950': 34.80
  };

  private static laborFeesByHeadStyle: Record<string, number> = {
    'FOUR_PRONG': 150.00,
    'SIX_PRONG': 180.00,
    'BEZEL': 220.00,
    'HALO': 350.00
  };

  private static diamondPriceFormula(carat: number): number {
    // Non-linear pricing curve based on industry Rapaport diamond tiers
    if (carat <= 0.5) return 650.00 * (carat / 0.5);
    if (carat <= 1.0) return 650.00 + (1850.00 - 650.00) * ((carat - 0.5) / 0.5);
    if (carat <= 1.5) return 1850.00 + (3400.00 - 1850.00) * ((carat - 1.0) / 0.5);
    if (carat <= 2.0) return 3400.00 + (6200.00 - 3400.00) * ((carat - 1.5) / 0.5);
    if (carat <= 3.0) return 6200.00 + (14500.00 - 6200.00) * ((carat - 2.0) / 1.0);
    return 14500.00 + (carat - 3.0) * 8500.00;
  }

  public static calculate(req: PricingCalculateRequest, baseMetalWeightGrams: number = 4.5): AuthoritativePriceResponse {
    const spotPrice = this.metalSpotPricesUSDPerGram[req.metalType] || 58.50;
    const metalRawCost = baseMetalWeightGrams * spotPrice;
    const markupMultiplier = 2.2; // Standard retail jewelry gross margin multiplier
    const metalCost = Math.round(metalRawCost * markupMultiplier * 100) / 100;

    const settingLabor = this.laborFeesByHeadStyle[req.headStyle] || 180.00;
    const stoneCost = Math.round(this.diamondPriceFormula(req.caratWeight) * 100) / 100;
    const engravingFee = req.engravingText && req.engravingText.trim().length > 0 ? 40.00 : 0.00;

    const subtotal = Math.round((metalCost + settingLabor + stoneCost + engravingFee) * 100) / 100;

    const breakdown: PriceBreakdown = {
      metalCost,
      settingLabor,
      stoneCost,
      engravingFee,
      markupMultiplier
    };

    const now = new Date();
    const expires = new Date(now.getTime() + 15 * 60 * 1000); // 15-minute price lock

    return {
      currency: 'USD',
      subtotal,
      breakdown,
      calculatedAt: now.toISOString(),
      expiresAt: expires.toISOString()
    };
  }
}
