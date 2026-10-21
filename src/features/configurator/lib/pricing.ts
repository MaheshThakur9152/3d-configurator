import { ConfiguratorState } from '../types/configurator.types';

export function calculateBasePrice(state: {
  metalDelta: number;
  caratDelta: number;
  quality: string;
  origin: string;
  eternityActive: boolean;
  eternityDelta: number;
}): number {
  let base = 7836; // Initial verified reference price for White Gold, 1ct, Natural, Good

  // Metal adjustment
  base += state.metalDelta;

  // Carat adjustment
  base += state.caratDelta;

  // Origin adjustment
  if (state.origin === 'lab') {
    base -= 3200;
  }

  // Quality adjustment
  if (state.quality === 'excellent') base += 600;
  else if (state.quality === 'very_good') base += 300;
  else if (state.quality === 'fair') base -= 400;
  else if (state.quality === 'poor') base -= 800;

  // Eternity ring addition
  if (state.eternityActive) {
    base += state.eternityDelta;
  }

  return Math.max(500, base);
}

export function calculateConfiguratorPrice(state: ConfiguratorState): number {
  return calculateBasePrice({
    metalDelta: state.selectedMetal.priceDelta,
    caratDelta: state.selectedCarat.priceDelta,
    quality: state.selectedQuality,
    origin: state.selectedOrigin,
    eternityActive: state.eternityActive,
    eternityDelta: state.selectedEternity.priceDelta,
  });
}

export function formatPrice(num: number): string {
  return '$ ' + num.toLocaleString('en-US');
}
