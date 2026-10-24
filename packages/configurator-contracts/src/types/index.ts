export type MetalType =
  | '18K_YELLOW_GOLD'
  | '18K_WHITE_GOLD'
  | '18K_ROSE_GOLD'
  | 'PLATINUM_950';

export type MetalFinish = 'HIGH_POLISH' | 'SATIN_BRUSHED';

export type StoneShape =
  | 'ROUND_BRILLIANT'
  | 'OVAL'
  | 'EMERALD_CUT'
  | 'PEAR'
  | 'CUSHION'
  | 'PRINCESS';

export type GemstoneType =
  | 'DIAMOND_WHITE'
  | 'DIAMOND_YELLOW'
  | 'DIAMOND_PINK'
  | 'DIAMOND_BLUE'
  | 'RUBY'
  | 'SAPPHIRE'
  | 'EMERALD';

export type HeadStyle = 'FOUR_PRONG' | 'SIX_PRONG' | 'BEZEL' | 'HALO';

export type MaterialId = 'metal.pbr.v1' | 'diamond.refraction.v1' | 'diamond.custom.v1';

export type SemanticComponentSlot =
  | 'Shank'
  | 'Setting'
  | 'Prongs'
  | 'CenterStone'
  | 'SideStones'
  | 'PaveStones';

export interface PriceBreakdown {
  metalCost: number;
  settingLabor: number;
  stoneCost: number;
  engravingFee: number;
  markupMultiplier: number;
}

export interface AuthoritativePriceResponse {
  currency: string;
  subtotal: number;
  breakdown: PriceBreakdown;
  calculatedAt: string;
  expiresAt: string;
}
