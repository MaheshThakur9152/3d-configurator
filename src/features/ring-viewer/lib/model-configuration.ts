import * as THREE from 'three';
import { ConfiguratorState } from '@/features/configurator/types/configurator.types';
import { createMetalMaterial } from './ring-materials';
import { createGemstoneMaterial } from './gemstone-materials';
import { MeshRole } from '../types/viewer.types';

/**
 * Determines and caches the functional role of a mesh in the jewelry hierarchy.
 * Identifies:
 * - Centerstone: 'Gem 01' or 'mesh_21'
 * - Accent pavé / side diamonds: 'Gem 02' or material containing 'Gem'
 * - Precious metal settings & bands: 'Metal', 'Metal 01', 'Metal 02'
 */
export function identifyMeshRole(
  mesh: THREE.Mesh,
  defaultRole: MeshRole = 'metal'
): MeshRole {
  if (mesh.userData.role) {
    return mesh.userData.role as MeshRole;
  }

  const mat = mesh.material as THREE.Material;
  const matName = mat?.name || '';

  let role: MeshRole = defaultRole;

  if (matName === 'Gem 01' || mesh.name === 'mesh_21') {
    role = 'centerGem';
  } else if (matName === 'Gem 02' || matName.includes('Gem')) {
    role = 'sideGem';
  } else if (
    matName.includes('Metal') ||
    matName === 'Metal 01' ||
    matName === 'Metal 02'
  ) {
    role = 'metal';
  }

  mesh.userData.role = role;
  return role;
}

/**
 * Updates all mesh materials and transforms across the shank, head, and eternity band
 * based on user configurator state.
 */
export function syncRingState(
  state: ConfiguratorState,
  shankScene: THREE.Group | null,
  headScene: THREE.Group | null,
  eternityScene: THREE.Group | null
): void {
  // Generate active PBR materials
  const metalMat = createMetalMaterial(state.selectedMetal);
  const centerGemMat = createGemstoneMaterial(state.selectedCenterstone, true);
  const sideGemMat = createGemstoneMaterial(state.selectedSideDiamond, false);

  const applyRoleMaterial = (mesh: THREE.Mesh, defaultRole: MeshRole) => {
    const role = identifyMeshRole(mesh, defaultRole);
    if (role === 'metal') {
      mesh.material = metalMat;
    } else if (role === 'centerGem') {
      mesh.material = centerGemMat;
    } else if (role === 'sideGem') {
      mesh.material = sideGemMat;
    }
  };

  // 1. Update Shank (metal + pavé side diamonds)
  if (shankScene) {
    shankScene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        applyRoleMaterial(child as THREE.Mesh, 'metal');
      }
    });
  }

  // 2. Update Head (center diamond/gem + prong metal) & Carat Scale
  if (headScene) {
    const s = state.selectedCarat.scale;
    headScene.scale.set(s, s, s);

    headScene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        applyRoleMaterial(child as THREE.Mesh, 'metal');
      }
    });
  }

  // 3. Update Eternity Band visibility & metal
  if (eternityScene) {
    eternityScene.visible = state.eternityActive;
    eternityScene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        applyRoleMaterial(child as THREE.Mesh, 'metal');
      }
    });
  }
}
