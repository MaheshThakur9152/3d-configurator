import * as THREE from 'three';
import { MetalOption } from '@/features/configurator/types/configurator.types';

/**
 * Calibrated spectral reflectance colors for fine jewelry precious metals.
 * Pure physical conductors (metalness = 1.0) with micro-clearcoat for authentic luster.
 */
const METAL_CALIBRATION: Record<string, { color: string; roughness: number; clearcoat: number; envMapIntensity: number }> = {
  white_gold: {
    color: '#dce0e3', // Calibrated rhodium-plated white gold luster matching studio reference
    roughness: 0.012, // High-gloss mirror polish
    clearcoat: 0.0,   // Pure conductor surface (zero dielectric varnish)
    envMapIntensity: 2.8,
  },
  yellow_gold: {
    color: '#ecc068', // Rich, warm 18k yellow luxury gold
    roughness: 0.02,
    clearcoat: 0.0,
    envMapIntensity: 2.6,
  },
  rose_gold: {
    color: '#e59a85', // Warm copper-pink 18k rose gold blush tone
    roughness: 0.02,
    clearcoat: 0.0,
    envMapIntensity: 2.6,
  },
  platinum: {
    color: '#c8cbce', // Deep, cool 950 platinum sheen
    roughness: 0.01,
    clearcoat: 0.0,
    envMapIntensity: 3.0,
  },
};

/**
 * Creates a physically-based material (MeshPhysicalMaterial) for jewelry precious metals.
 * Uses pure conductor metalness (1.0) and spectral calibration to eliminate dielectric haze.
 */
export function createMetalMaterial(metal: MetalOption): THREE.MeshPhysicalMaterial {
  const profile = METAL_CALIBRATION[metal.id] || {
    color: metal.colorHex,
    roughness: 0.02,
    clearcoat: 0.0,
    envMapIntensity: 2.6,
  };

  const metalColor = new THREE.Color(profile.color);

  return new THREE.MeshPhysicalMaterial({
    name: `Metal_${metal.id}`,
    color: metalColor,
    metalness: 1.0,                       // 100% conductor: eliminates plastic haze
    roughness: profile.roughness,         // Mirror polish with subtle micro-roughness
    clearcoat: profile.clearcoat,
    clearcoatRoughness: 0.0,
    envMapIntensity: profile.envMapIntensity, // Calibrated studio HDR reflections
  });
}
