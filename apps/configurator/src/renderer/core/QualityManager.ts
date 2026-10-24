export type QualityTier = 'HIGH' | 'MEDIUM' | 'LOW';

export interface QualityProfile {
  tier: QualityTier;
  maxDpr: number;
  shadowMapRes: number;
  fastChroma: boolean;
  enablePostProcessing: boolean;
}

export class QualityManager {
  private static cachedProfile?: QualityProfile;

  public static getProfile(): QualityProfile {
    if (this.cachedProfile) return this.cachedProfile;

    const isMobile = typeof window !== 'undefined' && (
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
      window.innerWidth < 768
    );

    const isLowPower = typeof navigator !== 'undefined' && (
      (navigator as any).hardwareConcurrency && (navigator as any).hardwareConcurrency <= 4
    );

    if (isLowPower) {
      this.cachedProfile = {
        tier: 'LOW',
        maxDpr: 1.0,
        shadowMapRes: 512,
        fastChroma: true,
        enablePostProcessing: false
      };
    } else if (isMobile) {
      this.cachedProfile = {
        tier: 'MEDIUM',
        maxDpr: 1.5,
        shadowMapRes: 512,
        fastChroma: true,
        enablePostProcessing: true
      };
    } else {
      this.cachedProfile = {
        tier: 'HIGH',
        maxDpr: 2.0,
        shadowMapRes: 1024,
        fastChroma: false,
        enablePostProcessing: true
      };
    }

    return this.cachedProfile;
  }
}
