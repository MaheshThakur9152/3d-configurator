import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { MetalOption, GemstoneOption } from '@/features/configurator/types/configurator.types';

export type SemanticMeshRole =
  | 'metal'
  | 'centerGem'
  | 'sideGem'
  | 'prongs'
  | 'band'
  | 'accent'
  | 'unassigned';

// Backward compatibility alias
export type MeshRole = SemanticMeshRole;

export type ProductCategory =
  | 'ring'
  | 'eternity_band'
  | 'necklace'
  | 'earrings'
  | 'bracelet'
  | 'custom';

/**
 * Strictly typed environment resources contract.
 * Separates pre-filtered PMREM textures from raw equirectangular source textures.
 */
export interface JewelleryEnvironmentResources {
  metalPmrem: THREE.Texture;
  gemPmrem: THREE.Texture;
  gemEquirectangular: THREE.Texture;
  proceduralFallback: boolean;
}

export interface SharedSceneLights {
  ambient: THREE.AmbientLight;
  key: THREE.DirectionalLight;
  fill: THREE.DirectionalLight;
  rim: THREE.DirectionalLight;
  backRim: THREE.DirectionalLight;
}

export interface SharedSceneContext {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  controls: OrbitControls;
  pmremGenerator: THREE.PMREMGenerator;
  contactShadowMesh: THREE.Mesh;
  lights: SharedSceneLights;
  dispose: () => void;
}

export interface MeshNodeInfo {
  id: string;
  name: string;
  uuid: string;
  vertexCount: number;
  triangleCount: number;
  materialName: string;
  assignedRole: SemanticMeshRole;
  isDesignerAssigned?: boolean;
}

export interface ProductCapabilities {
  supportedMetals: string[];
  supportedGemstones: string[];
  supportedCarats: number[];
  allowEternityStack: boolean;
}

export interface PublishedProductManifest {
  id: string;
  title: string;
  category: ProductCategory;
  modelFileName: string;
  fileSizeMB: number;
  meshCount: number;
  totalTriangles: number;
  roles: Record<string, SemanticMeshRole>;
  capabilities: ProductCapabilities;
  createdAt: string;
}

export interface MaterialProfileOptions {
  metal?: MetalOption | string;
  centerGem?: GemstoneOption | string;
  sideGem?: GemstoneOption | string;
  environments?: JewelleryEnvironmentResources | null;
  centerGemScale?: number;
}
