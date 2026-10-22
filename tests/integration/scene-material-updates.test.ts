import test from 'node:test';
import assert from 'node:assert';
import * as THREE from 'three';
import {
  applyMaterialProfileToMesh,
  syncObjectMaterials,
} from '../../src/features/shared-viewer/lib/materialProfileBridge.ts';

test('sceneMaterialUpdates: multi-mesh ring hierarchy correctly isolates updates', () => {
  const ring = new THREE.Group();

  const shank = new THREE.Mesh(new THREE.BufferGeometry(), new THREE.MeshBasicMaterial());
  shank.name = 'shank_band';
  shank.userData.role = 'metal';
  ring.add(shank);

  const prongs = new THREE.Mesh(new THREE.BufferGeometry(), new THREE.MeshBasicMaterial());
  prongs.name = 'prong_setting';
  prongs.userData.role = 'prongs';
  ring.add(prongs);

  const centerStone = new THREE.Mesh(new THREE.BufferGeometry(), new THREE.MeshBasicMaterial());
  centerStone.name = 'Diamond_Oval';
  centerStone.userData.role = 'centerGem';
  ring.add(centerStone);

  const paveStone = new THREE.Mesh(new THREE.BufferGeometry(), new THREE.MeshBasicMaterial());
  paveStone.name = 'pave_01';
  paveStone.userData.role = 'sideGem';
  ring.add(paveStone);

  // Initial sync with Yellow Gold and 1.0ct
  syncObjectMaterials(ring, {
    metal: 'yellow_gold',
    centerGem: 'diamond',
    sideGem: 'diamond',
    centerGemScale: 1.0,
  });

  const yellowGoldMat = shank.material as THREE.MeshPhysicalMaterial;
  assert.strictEqual(yellowGoldMat.name, 'Metal_yellow_gold');
  assert.strictEqual(prongs.material, shank.material); // Both metal roles share or receive metal material
  assert.strictEqual(centerStone.scale.x, 1.0);

  // Update to Rose Gold and 1.5ct
  syncObjectMaterials(ring, {
    metal: 'rose_gold',
    centerGem: 'diamond',
    sideGem: 'diamond',
    centerGemScale: 1.5,
  });

  const roseGoldMat = shank.material as THREE.MeshPhysicalMaterial;
  assert.strictEqual(roseGoldMat.name, 'Metal_rose_gold');
  assert.strictEqual(centerStone.scale.x, 1.5);
  // Pavé stone and prongs must NOT be scaled by carat scale
  assert.strictEqual(prongs.scale.x, 1.0);
  assert.strictEqual(paveStone.scale.x, 1.0);
});
