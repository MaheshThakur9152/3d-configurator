import * as THREE from 'three';
import { GemstoneOption } from '@/features/configurator/types/configurator.types';
import { createDiamondShaderMaterial } from '@/features/diamond-shader/DiamondShaderMaterial';

/**
 * Creates gemstone materials for the jewelry scene.
 *
 * Diamond Physical Configuration:
 * - Clean-room optical diamond shader with multi-bounce Snell refraction,
 *   Total Internal Reflection (TIR), chromatic dispersion, and facet contrast extinction.
 * - Pavé side diamonds utilize calibrated non-diffuse PBR with flat facet normals.
 *
 * Colored Gemstones:
 * - Calibrated transmission tint, physical volume absorption, and specific IOR.
 */
export function createGemstoneMaterial(
  gemstone: GemstoneOption,
  isCenterstone: boolean = true,
  envMap?: THREE.Texture | null
): THREE.Material {
  const isDiamond = gemstone.id === 'diamond';

  if (isDiamond) {
    if (isCenterstone && envMap) {
      try {
        return createDiamondShaderMaterial({
          envMap,
          envMapIntensity: 1.4,
          refractiveIndex: 2.417,
          dispersion: 0.044,
          boost: 1.25,
        });
      } catch (err) {
        console.warn(
          '[GemstoneMaterial] Custom diamond shader failed, falling back to MeshPhysicalMaterial:',
          err
        );
      }
    }

    const mat = new THREE.MeshPhysicalMaterial({
      name: isCenterstone ? 'Gem 01' : 'Gem 02',
      color: new THREE.Color(0x0a0a0a), // Zero diffuse chalk - pure specular & internal refraction
      transmission: isCenterstone ? 0.78 : 0.22,
      opacity: 1.0,
      transparent: true,
      roughness: 0.0,
      metalness: 0.0,
      ior: 2.417,
      reflectivity: 1.0,
      envMapIntensity: isCenterstone ? 4.0 : 2.8,
      clearcoat: 1.0,
      clearcoatRoughness: 0.0,
      dispersion: 0.044,
      thickness: isCenterstone ? 2.8 : 1.2,
      attenuationColor: new THREE.Color(0xffffff),
      attenuationDistance: 8.0,
      flatShading: true, // Guarantees individual, razor-sharp facet reflections
    });

    if (envMap) {
      mat.envMap = envMap;
    }

    return mat;
  }

  // Colored gemstones (Sapphire, Ruby, Emerald, etc.)
  const gemTint = new THREE.Color(gemstone.transmissionColor);

  const mat = new THREE.MeshPhysicalMaterial({
    name: isCenterstone ? 'Gem 01' : 'Gem 02',
    color: gemTint,
    transmission: isCenterstone ? 0.72 : 0.35,
    opacity: 1.0,
    transparent: true,
    roughness: 0.0,
    metalness: 0.0,
    ior: gemstone.ior,
    reflectivity: 1.0,
    envMapIntensity: isCenterstone ? 3.2 : 2.4,
    clearcoat: 1.0,
    clearcoatRoughness: 0.0,
    dispersion: 0.02,
    thickness: isCenterstone ? 2.5 : 1.0,
    attenuationColor: gemTint,
    attenuationDistance: 3.5,
    flatShading: true,
  });

  if (envMap) {
    mat.envMap = envMap;
  }

  return mat;
}
