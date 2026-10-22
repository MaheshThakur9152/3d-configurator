export type SemanticMeshRole =
  | 'metal'
  | 'centerGem'
  | 'sideGem'
  | 'prongs'
  | 'band'
  | 'accent'
  | 'unassigned';

export type ProductCategory =
  | 'ring'
  | 'eternity_band'
  | 'necklace'
  | 'earrings'
  | 'bracelet'
  | 'custom';

export interface MeshNodeInfo {
  id: string;
  name: string;
  uuid: string;
  vertexCount: number;
  triangleCount: number;
  materialName: string;
  assignedRole: SemanticMeshRole;
  meshRef?: unknown;
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
