import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { ConfiguratorState } from '@/features/configurator/types/configurator.types';

export type MeshRole = 'metal' | 'centerGem' | 'sideGem';

export interface RingViewerProps {
  state: ConfiguratorState;
  onToggleFullscreen: () => void;
}

export interface ViewerSceneContext {
  scene: THREE.Scene;
  renderer: THREE.WebGLRenderer;
  camera: THREE.PerspectiveCamera;
  controls: OrbitControls;
  ringGroup: THREE.Group;
  shankMeshGroup: THREE.Group | null;
  headMeshGroup: THREE.Group | null;
  eternityMeshGroup: THREE.Group | null;
  pmremGenerator: THREE.PMREMGenerator;
}
