import * as THREE from 'three';
import { GemstoneOption } from '@/features/configurator/types/configurator.types';

/**
 * Creates gemstone materials for the jewelry scene.
 *
 * Diamond Physical Configuration:
 * - Pure optical transmission (90% transmission, 10% reflective facet presence)
 * - True diamond refractive index (n = 2.417)
 * - Three.js native spectral dispersion (0.044) for chromatic fire flashes
 * - Mirror facet polish (roughness: 0.0, clearcoat: 1.0)
 * - Volumetric depth attenuation (thickness: 2.8, attenuationDistance: 10.0)
 * - Studio environment reflection intensity: 5.5
 *
 * Colored Gemstones:
 * - Calibrated transmission tint, physical volume absorption, and specific IOR.
 */
export function createGemstoneMaterial(
  gemstone: GemstoneOption,
  isCenterstone: boolean = true,
  _envMap?: THREE.Texture | null
): THREE.Material {
  const isDiamond = gemstone.id === 'diamond';

  if (isDiamond) {
    return new THREE.MeshPhysicalMaterial({
      name: isCenterstone ? 'Gem 01' : 'Gem 02',
      color: new THREE.Color(0xffffff),
      transmission: isCenterstone ? 0.90 : 0.94,
      opacity: 1.0,
      transparent: true,
      roughness: 0.0,
      metalness: 0.0,
      ior: 2.417,
      reflectivity: 1.0,
      envMapIntensity: isCenterstone ? 5.5 : 3.8,
      clearcoat: 1.0,
      clearcoatRoughness: 0.0,
      dispersion: 0.044,
      thickness: isCenterstone ? 2.8 : 1.2,
      attenuationColor: new THREE.Color(0xffffff),
      attenuationDistance: 10.0,
      flatShading: false,
    });
  }

  // Colored gemstones (Sapphire, Ruby, Emerald, etc.)
  const gemTint = new THREE.Color(gemstone.transmissionColor);

  return new THREE.MeshPhysicalMaterial({
    name: isCenterstone ? 'Gem 01' : 'Gem 02',
    color: gemTint,
    transmission: 0.86,
    opacity: 1.0,
    transparent: true,
    roughness: 0.0,
    metalness: 0.0,
    ior: gemstone.ior,
    reflectivity: 1.0,
    envMapIntensity: isCenterstone ? 4.2 : 3.2,
    clearcoat: 1.0,
    clearcoatRoughness: 0.0,
    dispersion: 0.02,
    thickness: isCenterstone ? 2.5 : 1.0,
    attenuationColor: gemTint,
    attenuationDistance: 4.0,
    flatShading: false,
  });
}
