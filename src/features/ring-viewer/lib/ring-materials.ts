import * as THREE from 'three';
import { MetalOption } from '@/features/configurator/types/configurator.types';

/**
 * Calibrated spectral reflectance colors for fine jewelry precious metals.
 * Pure physical conductors (metalness = 1.0) with micro-clearcoat for authentic luster.
 */
const METAL_CALIBRATION: Record<string, { color: string; roughness: number; clearcoat: number }> = {
  white_gold: {
    color: '#e5e7ea', // Rhodium-plated white gold luster
    roughness: 0.06,
    clearcoat: 0.20,
  },
  yellow_gold: {
    color: '#f4ce6a', // Rich, buttery 18k luxury gold
    roughness: 0.07,
    clearcoat: 0.15,
  },
  rose_gold: {
    color: '#e89a82', // Warm copper-gold blush tone
    roughness: 0.07,
    clearcoat: 0.15,
  },
  platinum: {
    color: '#d8dadc', // Deep, cool 950 platinum sheen
    roughness: 0.05,
    clearcoat: 0.25,
  },
};

/**
 * Creates a physically-based material (MeshPhysicalMaterial) for jewelry precious metals.
 * Uses pure conductor metalness (1.0) and spectral calibration to eliminate dielectric haze.
 */
export function createMetalMaterial(metal: MetalOption): THREE.MeshPhysicalMaterial {
  const profile = METAL_CALIBRATION[metal.id] || {
    color: metal.colorHex,
    roughness: metal.roughness,
    clearcoat: 0.15,
  };

  const metalColor = new THREE.Color(profile.color);

  return new THREE.MeshPhysicalMaterial({
    name: `Metal_${metal.id}`,
    color: metalColor,
    metalness: 1.0,                       // 100% conductor: eliminates plastic haze
    roughness: profile.roughness,         // Mirror polish with subtle micro-roughness
    clearcoat: profile.clearcoat,         // High-gloss surface finishing
    clearcoatRoughness: 0.08,
    envMapIntensity: 2.6,                 // Calibrated studio HDR reflections
  });
}
