import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

export interface LoadedModels {
  shankScene: THREE.Group;
  headScene: THREE.Group;
  eternityScene: THREE.Group;
}

/**
 * Loads and calibrates the ring GLB/DRACO assets.
 */
export async function loadRingModels(): Promise<LoadedModels> {
  const loader = new GLTFLoader();
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath('/draco/gltf/');
  loader.setDRACOLoader(dracoLoader);

  const loadModel = (path: string): Promise<THREE.Group> => {
    return new Promise((resolve, reject) => {
      loader.load(
        path,
        (gltf) => resolve(gltf.scene),
        undefined,
        (error) => reject(error)
      );
    });
  };

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

  return {
    shankScene,
    headScene,
    eternityScene,
  };
}
