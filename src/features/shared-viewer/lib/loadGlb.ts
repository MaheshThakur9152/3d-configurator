import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

let sharedLoader: GLTFLoader | null = null;
let sharedDraco: DRACOLoader | null = null;

export function getSharedGltfLoader(): GLTFLoader {
  if (!sharedLoader) {
    sharedLoader = new GLTFLoader();
    sharedDraco = new DRACOLoader();
    sharedDraco.setDecoderPath('/draco/gltf/');
    sharedLoader.setDRACOLoader(sharedDraco);
  }
  return sharedLoader;
}

/**
 * Loads a GLB from a URL or ArrayBuffer and tags meshes with original materials.
 */
export async function loadGlbModel(source: string | ArrayBuffer): Promise<THREE.Group> {
  const loader = getSharedGltfLoader();

  return new Promise<THREE.Group>((resolve, reject) => {
    const onLoad = (gltf: { scene: THREE.Group }) => {
      const scene = gltf.scene;
      let meshCounter = 0;
      scene.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          meshCounter++;
          if (!mesh.userData.id) {
            mesh.userData.id = `node_${meshCounter}`;
          }
          if (!mesh.userData.originalMaterial) {
            mesh.userData.originalMaterial = mesh.material;
          }
        }
      });
      resolve(scene);
    };

    if (typeof source === 'string') {
      loader.load(source, onLoad, undefined, reject);
    } else {
      loader.parse(source, '', onLoad, reject);
    }
  });
}
