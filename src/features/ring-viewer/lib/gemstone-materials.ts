import * as THREE from 'three';
import { GemstoneOption } from '@/features/configurator/types/configurator.types';

/**
 * Creates a physically-based material (MeshPhysicalMaterial) for cut gemstones.
 *
 * DIAMOND CORRECTION:
 * Real cut diamonds have high refractive transmission and mirror-like facet reflections.
 * In the baseline implementation, the diamond had color: 0xfcfdff with transmission: 0.35
 * and flatShading: true, which caused 65% of light to diffusely scatter as an opaque chalky
 * white substance (resembling a porcelain egg).
 *
 * Conversely, setting color to 0x000000 filters out 100% of transmitted light in Three.js,
 * resulting in an unnaturally black stone.
 *
 * The physically accurate Three.js diamond material:
 * - color: 0xffffff (pure optical transmission filter)
 * - transmission: 0.92 (92% refractive transmission)
 * - ior: 2.417 (true optical diamond index of refraction)
 * - dispersion: 0.044 (spectral chromatic dispersion / fire)
 * - roughness: 0.0 & clearcoat: 1.0 (mirror-polished facets)
 * - envMapIntensity: 4.5 (brilliant specular highlights from studio environment)
 * - thickness: 2.5 & attenuationDistance: 10.0 (volume depth)
 * - flatShading: false (preserves clean CAD facet vertex normals from Rhino/MatrixGold)
 */
export function createGemstoneMaterial(
  gemstone: GemstoneOption,
  isCenterstone: boolean = true
): THREE.MeshPhysicalMaterial {
  const isDiamond = gemstone.id === 'diamond';

  if (isDiamond) {
    return new THREE.MeshPhysicalMaterial({
      name: isCenterstone ? 'Gem 01' : 'Gem 02',
      color: new THREE.Color(0xffffff),
      transmission: 0.92,
      opacity: 1.0,
      transparent: true,
      roughness: 0.0,
      metalness: 0.0,
      ior: 2.417,
      reflectivity: 1.0,
      envMapIntensity: isCenterstone ? 4.5 : 3.5,
      clearcoat: 1.0,
      clearcoatRoughness: 0.0,
      dispersion: 0.044,
      thickness: isCenterstone ? 2.5 : 1.2,
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
    transmission: 0.85,
    opacity: 1.0,
    transparent: true,
    roughness: 0.0,
    metalness: 0.0,
    ior: gemstone.ior,
    reflectivity: 1.0,
    envMapIntensity: isCenterstone ? 4.0 : 3.0,
    clearcoat: 1.0,
    clearcoatRoughness: 0.0,
    dispersion: 0.02,
    thickness: isCenterstone ? 2.5 : 1.0,
    attenuationColor: gemTint,
    attenuationDistance: 4.0,
    flatShading: false,
  });
}
