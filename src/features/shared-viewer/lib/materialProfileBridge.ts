import * as THREE from 'three';
import { MetalOption, GemstoneOption } from '@/features/configurator/types/configurator.types';
import { METAL_OPTIONS, GEMSTONE_OPTIONS } from '@/features/configurator/data/configuration-options';
import { createMetalMaterial } from '@/features/ring-viewer/lib/ring-materials';
import { createGemstoneMaterial } from '@/features/ring-viewer/lib/gemstone-materials';
import { SemanticMeshRole, MaterialProfileOptions } from '../types/jewelleryViewer.types';
import { identifyMeshRole } from './identifyMeshRole';

/**
 * Resolves a MetalOption from either a full object or string id.
 */
export function resolveMetalOption(metal?: MetalOption | string): MetalOption {
  if (typeof metal === 'object' && metal !== null) {
    return metal;
  }
  const id = typeof metal === 'string' ? metal : 'white_gold';
  const found = METAL_OPTIONS.find((m) => m.id === id);
  if (found) return found;

  // Platinum or custom fallback
  if (id === 'platinum') {
    return {
      id: 'platinum',
      name: 'Platinum 950',
      icon: '',
      colorHex: '#c8cbce',
      metalness: 1.0,
      roughness: 0.01,
      priceDelta: 500,
    };
  }

  return METAL_OPTIONS[1]; // default white gold
}

/**
 * Resolves a GemstoneOption from either a full object or string id.
 */
export function resolveGemstoneOption(gem?: GemstoneOption | string): GemstoneOption {
  if (typeof gem === 'object' && gem !== null) {
    return gem;
  }
  const id = typeof gem === 'string' ? gem : 'diamond';
  const found = GEMSTONE_OPTIONS.find((g) => g.id === id);
  return found || GEMSTONE_OPTIONS[0]; // default diamond
}

/**
 * Applies the canonical jewellery material profile to a mesh based on its semantic role.
 * Ensures strict rendering parity across Configurator and Model Inspector.
 */
export function applyMaterialProfileToMesh(
  mesh: THREE.Mesh,
  role: SemanticMeshRole,
  options: MaterialProfileOptions
): void {
  // Always preserve original material if not already stored
  if (!mesh.userData.originalMaterial) {
    mesh.userData.originalMaterial = mesh.material;
  }

  mesh.userData.role = role;
  mesh.userData.assignedRole = role;

  const envs = options.environments;
  const metalOpt = resolveMetalOption(options.metal);
  const centerGemOpt = resolveGemstoneOption(options.centerGem);
  const sideGemOpt = resolveGemstoneOption(options.sideGem);

  switch (role) {
    case 'metal':
    case 'band':
    case 'prongs': {
      const metalMat = createMetalMaterial(metalOpt);
      if (envs?.metalPmrem) {
        metalMat.envMap = envs.metalPmrem;
      }
      mesh.material = metalMat;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      break;
    }

    case 'centerGem': {
      // Pass raw spherical equirectangular texture for custom shader, or PMREM fallback
      const gemEnv = envs?.gemEquirectangular || envs?.gemPmrem || null;
      const gemMat = createGemstoneMaterial(centerGemOpt, true, gemEnv);
      mesh.material = gemMat;
      mesh.castShadow = false;
      mesh.receiveShadow = false;

      // Apply carat scale if provided
      if (options.centerGemScale !== undefined && options.centerGemScale > 0) {
        mesh.scale.set(options.centerGemScale, options.centerGemScale, options.centerGemScale);
      }
      break;
    }

    case 'sideGem':
    case 'accent': {
      // Accent pavé diamonds use the calibrated side stone PBR profile
      const sideEnv = envs?.gemPmrem || envs?.metalPmrem || null;
      const sideMat = createGemstoneMaterial(sideGemOpt, false, sideEnv);
      mesh.material = sideMat;
      mesh.castShadow = false;
      mesh.receiveShadow = false;
      break;
    }

    case 'unassigned':
    default: {
      // Preserve original imported glTF material
      if (mesh.userData.originalMaterial) {
        mesh.material = mesh.userData.originalMaterial;
      }
      break;
    }
  }
}

/**
 * Traverses an Object3D hierarchy and applies material profiles to all meshes.
 * Caches and shares material instances across meshes of the same role to minimize GPU memory.
 */
export function syncObjectMaterials(
  root: THREE.Object3D,
  options: MaterialProfileOptions,
  manifestRoles?: Record<string, SemanticMeshRole>,
  defaultRole: SemanticMeshRole = 'unassigned'
): void {
  const materialCache = new Map<string, THREE.Material>();

  const getRoleGroup = (role: SemanticMeshRole): string => {
    if (role === 'metal' || role === 'band' || role === 'prongs') return 'metal';
    if (role === 'sideGem' || role === 'accent') return 'sideGem';
    return role;
  };

  root.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      const mesh = child as THREE.Mesh;
      const role = identifyMeshRole(mesh, defaultRole, manifestRoles);
      const groupKey = getRoleGroup(role);

      if (groupKey !== 'centerGem' && groupKey !== 'unassigned' && materialCache.has(groupKey)) {
        if (!mesh.userData.originalMaterial) {
          mesh.userData.originalMaterial = mesh.material;
        }
        mesh.material = materialCache.get(groupKey)!;
        mesh.userData.role = role;
        mesh.userData.assignedRole = role;
        mesh.castShadow = groupKey === 'metal';
        mesh.receiveShadow = groupKey === 'metal';
      } else {
        applyMaterialProfileToMesh(mesh, role, options);
        if (groupKey !== 'centerGem' && groupKey !== 'unassigned') {
          materialCache.set(groupKey, mesh.material as THREE.Material);
        }
      }
    }
  });
}
