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
  const nodeName = mesh.name || '';
  const lowerMat = matName.toLowerCase();
  const lowerNode = nodeName.toLowerCase();

  let role: MeshRole = defaultRole;

  // 1. Center stone identification
  // Matches: 'Gem 01', 'Diamond_Oval', explicit center/main tags, or 'mesh_21' in head (non-metal)
  const isCenterName =
    lowerNode.includes('diamond_oval') ||
    lowerNode.includes('center') ||
    lowerNode.includes('main_gem') ||
    lowerNode.includes('solitaire');

  const isHeadMesh21 =
    (nodeName === 'mesh_21' || nodeName === 'Diamond_Oval') &&
    !lowerMat.includes('metal');

  if (matName === 'Gem 01' || isCenterName || isHeadMesh21) {
    role = 'centerGem';
  }
  // 2. Metal detection
  else if (
    lowerMat.includes('metal') ||
    lowerMat.includes('gold') ||
    lowerMat.includes('plat') ||
    lowerNode.includes('metal') ||
    lowerNode.includes('shank') ||
    lowerNode.includes('band') ||
    lowerNode.includes('prong')
  ) {
    role = 'metal';
  }
  // 3. Side / pavé diamond detection
  else if (
    matName === 'Gem 02' ||
    lowerMat.includes('gem') ||
    lowerMat.includes('diam') ||
    lowerNode.includes('pave') ||
    lowerNode.includes('side') ||
    lowerNode.includes('halo') ||
    lowerNode.includes('accent')
  ) {
    role = 'sideGem';
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
  eternityScene: THREE.Group | null,
  envMap?: THREE.Texture | null
): void {
  // Generate active PBR and optical materials
  const metalMat = createMetalMaterial(state.selectedMetal);
  const centerGemMat = createGemstoneMaterial(state.selectedCenterstone, true, envMap);
  const sideGemMat = createGemstoneMaterial(state.selectedSideDiamond, false, envMap);

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

  // 2. Update Head (center diamond/gem + prong metal) & Isolated Carat Scale
  if (headScene) {
    const s = state.selectedCarat.scale;

    headScene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        const role = identifyMeshRole(mesh, 'metal');
        // Isolate carat scaling to the gemstone so prongs retain their true proportions
        if (role === 'centerGem') {
          mesh.scale.set(s, s, s);
        }
        applyRoleMaterial(mesh, 'metal');
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
