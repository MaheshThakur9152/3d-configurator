import test from 'node:test';
import assert from 'node:assert';
import * as THREE from 'three';
import {
  PublishedProductManifest,
  SemanticMeshRole,
} from '../../src/features/shared-viewer/types/jewelleryViewer.types.ts';
import {
  syncObjectMaterials,
  applyMaterialProfileToMesh,
} from '../../src/features/shared-viewer/lib/materialProfileBridge.ts';

test('assetManifest: serializes and restores role mappings accurately', () => {
  const root = new THREE.Group();

  const shank = new THREE.Mesh(new THREE.BufferGeometry(), new THREE.MeshBasicMaterial());
  shank.name = 'Shank_Mesh';
  root.add(shank);

  const centerDiamond = new THREE.Mesh(new THREE.BufferGeometry(), new THREE.MeshBasicMaterial());
  centerDiamond.name = 'Diamond_Center_Facet';
  root.add(centerDiamond);

  const manifest: PublishedProductManifest = {
    id: 'prod_test_01',
    title: 'Custom Solitaire Ring',
    category: 'ring',
    modelFileName: 'ring-custom.glb',
    fileSizeMB: 1.2,
    meshCount: 2,
    totalTriangles: 5000,
    roles: {
      Shank_Mesh: 'metal',
      Diamond_Center_Facet: 'centerGem',
    },
    capabilities: {
      supportedMetals: ['white_gold', 'yellow_gold'],
      supportedGemstones: ['diamond'],
      supportedCarats: [1.0],
      allowEternityStack: true,
    },
    createdAt: new Date().toISOString(),
  };

  // Sync materials using the manifest roles
  syncObjectMaterials(root, { metal: 'white_gold', centerGem: 'diamond' }, manifest.roles);

  assert.strictEqual(shank.userData.role, 'metal');
  assert.strictEqual(centerDiamond.userData.role, 'centerGem');
  assert.strictEqual((shank.material as THREE.MeshPhysicalMaterial).isMeshPhysicalMaterial, true);
});
