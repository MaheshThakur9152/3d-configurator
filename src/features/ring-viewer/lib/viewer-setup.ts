import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {
  createJewelleryScene,
  loadJewelleryEnvironments,
  JewelleryEnvironmentResources,
} from '@/features/shared-viewer';

export interface SetupViewerResult {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  controls: OrbitControls;
  ringGroup: THREE.Group;
  pmremGenerator: THREE.PMREMGenerator;
}

export interface StudioEnvironments {
  metalEnvMap: THREE.Texture;
  gemEnvMap: THREE.Texture;
  rawGemTexture: THREE.Texture;
}

/**
 * Loads authentic studio HDR and EXR environment maps for precious metals
 * and diamond optical scintillation.
 *
 * Uses the shared environment loader and fixes the rawGemTexture aliasing bug.
 */
export async function loadStudioEnvironments(
  pmremGenerator: THREE.PMREMGenerator
): Promise<StudioEnvironments> {
  const envs: JewelleryEnvironmentResources = await loadJewelleryEnvironments(pmremGenerator);
  return {
    metalEnvMap: envs.metalPmrem,
    gemEnvMap: envs.gemPmrem,
    rawGemTexture: envs.gemEquirectangular, // True raw EXR equirectangular texture for diamond shader
  };
}

/**
 * Initializes the Three.js 3D viewport, camera, renderer, controls, studio environment,
 * lights, and contact shadow plane using the shared jewellery scene foundation.
 */
export function setupViewer(
  canvas: HTMLCanvasElement,
  width: number,
  height: number
): SetupViewerResult {
  const { scene, camera, renderer, controls, pmremGenerator } = createJewelleryScene({
    canvas,
    width,
    height,
    shadowY: -0.52,
  });

  // Ring Group anchor with calibrated scale and orientation
  const ringGroup = new THREE.Group();
  ringGroup.rotation.y = Math.PI; // Prongs face forward toward camera
  ringGroup.scale.set(0.55, 0.55, 0.55);
  scene.add(ringGroup);

  return {
    scene,
    camera,
    renderer,
    controls,
    ringGroup,
    pmremGenerator,
  };
}
