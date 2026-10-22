import * as THREE from 'three';
import { ConfiguratorState } from '@/features/configurator/types/configurator.types';
import {
  identifyMeshRole as sharedIdentifyMeshRole,
  applyMaterialProfileToMesh,
  SemanticMeshRole,
} from '@/features/shared-viewer';

/**
 * Determines and caches the functional role of a mesh in the jewelry hierarchy.
 * Delegates to the shared classifier to maintain 100% role parity across Configurator and Inspector.
 */
export function identifyMeshRole(
  mesh: THREE.Mesh,
  defaultRole: SemanticMeshRole = 'metal'
): SemanticMeshRole {
  return sharedIdentifyMeshRole(mesh, defaultRole);
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
  gemEquirectangularOrEnv?: THREE.Texture | null,
  metalPmrem?: THREE.Texture | null
): void {
  const profileOptions = {
    metal: state.selectedMetal,
    centerGem: state.selectedCenterstone,
    sideGem: state.selectedSideDiamond,
    environments: {
      metalPmrem: metalPmrem || (gemEquirectangularOrEnv as THREE.Texture),
      gemPmrem: metalPmrem || (gemEquirectangularOrEnv as THREE.Texture),
      gemEquirectangular: gemEquirectangularOrEnv as THREE.Texture,
      proceduralFallback: false,
    },
    centerGemScale: state.selectedCarat.scale,
  };

  const applyToMesh = (mesh: THREE.Mesh, defaultRole: SemanticMeshRole) => {
    const role = identifyMeshRole(mesh, defaultRole);
    applyMaterialProfileToMesh(mesh, role, profileOptions);
  };

  // 1. Update Shank (metal + pavé side diamonds)
  if (shankScene) {
    shankScene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        applyToMesh(child as THREE.Mesh, 'metal');
      }
    });
  }

  // 2. Update Head (center diamond/gem + prong metal) & Isolated Carat Scale
  if (headScene) {
    headScene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        applyToMesh(child as THREE.Mesh, 'metal');
      }
    });
  }

  // 3. Update Eternity Band visibility & metal
  if (eternityScene) {
    eternityScene.visible = state.eternityActive;
    eternityScene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        applyToMesh(child as THREE.Mesh, 'metal');
      }
    });
  }
}
