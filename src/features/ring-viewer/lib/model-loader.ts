import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { optimizeSceneGeometry } from '@/features/shared-viewer/lib/GeometryOptimizer';

export interface LoadedModels {
  shankScene: THREE.Group;
  headScene: THREE.Group;
  eternityScene: THREE.Group;
}

// Global cached loader instance
let gltfLoaderInstance: GLTFLoader | null = null;
const modelCache = new Map<string, THREE.Group>();

function getLoader(): GLTFLoader {
  if (!gltfLoaderInstance) {
    const loader = new GLTFLoader();
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('/draco/gltf/');
    loader.setDRACOLoader(dracoLoader);
    gltfLoaderInstance = loader;
  }
  return gltfLoaderInstance;
}

/**
 * Loads a single GLB model with DRACO decompression and caching.
 */
export function loadModel(path: string): Promise<THREE.Group> {
  const cached = modelCache.get(path);
  if (cached) {
    return Promise.resolve(cached.clone(true));
  }

  const loader = getLoader();
  return new Promise((resolve, reject) => {
    loader.load(
      path,
      (gltf) => {
        modelCache.set(path, gltf.scene);
        resolve(gltf.scene.clone(true));
      },
      undefined,
      (error) => reject(error)
    );
  });
}

/**
 * Loads and calibrates the default initial ring GLB/DRACO assets.
 */
export async function loadRingModels(): Promise<LoadedModels> {
  const [shankScene, headScene, eternityScene] = await Promise.all([
    loadModel('/assets/models/sh_pave_1.glb'),
    loadModel('/assets/models/hd_oval_10.glb'),
    loadModel('/assets/models/et_plain_03.glb'),
  ]);

  // Calibrate shank node positioning
  shankScene.position.set(0, 0, 0);
  shankScene.scale.set(1, 1, 1);

  // Calibrate head/crown node positioning
  if (headScene.children[0]) {
    headScene.children[0].position.set(0, 0.13, 0);
    headScene.children[0].scale.set(0.13, 0.13, 0.13);
  }
  headScene.position.set(0, 0, 0);
  headScene.scale.set(1, 1, 1);

  // Calibrate eternity band positioning (tucked alongside the shank)
  if (eternityScene.children[0]) {
    eternityScene.children[0].position.set(0, 0, 0.32);
  }
  eternityScene.position.set(0, 0, 0);
  eternityScene.scale.set(1, 1, 1);
  eternityScene.visible = false;

  // Task 4.2: Optimize static geometries to minimize draw calls
  optimizeSceneGeometry(shankScene);
  optimizeSceneGeometry(headScene);
  optimizeSceneGeometry(eternityScene);

  return {
    shankScene,
    headScene,
    eternityScene,
  };
}

/**
 * Loads an eternity band model and applies standard stack positioning.
 */
export async function loadEternityModel(modelUrl: string): Promise<THREE.Group> {
  const scene = await loadModel(modelUrl);
  if (scene.children[0]) {
    scene.children[0].position.set(0, 0, 0.32);
  }
  scene.position.set(0, 0, 0);
  scene.scale.set(1, 1, 1);
  optimizeSceneGeometry(scene);
  return scene;
}
