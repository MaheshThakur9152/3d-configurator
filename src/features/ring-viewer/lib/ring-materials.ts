import * as THREE from 'three';
import { MetalOption } from '@/features/configurator/types/configurator.types';

/**
 * Creates a physically-based material (MeshPhysicalMaterial) for jewelry precious metals.
 * Uses calibrated metalness, roughness, clearcoat, and environmental reflection intensity.
 */
export function createMetalMaterial(metal: MetalOption): THREE.MeshPhysicalMaterial {
  const metalColor = new THREE.Color(metal.colorHex);

  return new THREE.MeshPhysicalMaterial({
    name: `Metal_${metal.id}`,
    color: metalColor,
    metalness: 0.95,
    roughness: metal.roughness,
    clearcoat: 0.15,
    clearcoatRoughness: 0.1,
    reflectivity: 0.92,
    envMapIntensity: 2.8,
  });
}
