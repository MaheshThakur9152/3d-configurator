import test from 'node:test';
import assert from 'node:assert';
import * as THREE from 'three';
import {
  applyMaterialProfileToMesh,
  resolveMetalOption,
  resolveGemstoneOption,
} from '../../src/features/shared-viewer/lib/materialProfileBridge.ts';

test('materialProfileBridge: resolves string metal IDs to valid MetalOption', () => {
  const wg = resolveMetalOption('white_gold');
  assert.strictEqual(wg.id, 'white_gold');
  assert.strictEqual(wg.metalness, 1.0);

  const yg = resolveMetalOption('yellow_gold');
  assert.strictEqual(yg.id, 'yellow_gold');

  const plat = resolveMetalOption('platinum');
  assert.strictEqual(plat.id, 'platinum');
  assert.strictEqual(plat.metalness, 1.0);
});

test('materialProfileBridge: applies pure conductor metal material to metal meshes', () => {
  const mesh = new THREE.Mesh(
    new THREE.BufferGeometry(),
    new THREE.MeshBasicMaterial({ name: 'orig_mat' })
  );

  applyMaterialProfileToMesh(mesh, 'metal', { metal: 'white_gold' });

  const mat = mesh.material as THREE.MeshPhysicalMaterial;
  assert.strictEqual(mat.isMeshPhysicalMaterial, true);
  assert.strictEqual(mat.metalness, 1.0);
  assert.strictEqual(mesh.castShadow, true);
});

test('materialProfileBridge: applies centerGem profile and scales carat dimension', () => {
  const mesh = new THREE.Mesh(
    new THREE.BufferGeometry(),
    new THREE.MeshBasicMaterial({ name: 'orig_gem' })
  );

  applyMaterialProfileToMesh(mesh, 'centerGem', {
    centerGem: 'diamond',
    centerGemScale: 1.25,
  });

  assert.strictEqual(mesh.scale.x, 1.25);
  assert.strictEqual(mesh.scale.y, 1.25);
  assert.strictEqual(mesh.scale.z, 1.25);
  assert.strictEqual(mesh.castShadow, false);
});

test('materialProfileBridge: preserves original material for unassigned meshes', () => {
  const originalMat = new THREE.MeshBasicMaterial({ name: 'custom_designer_glTF_mat' });
  const mesh = new THREE.Mesh(new THREE.BufferGeometry(), originalMat);

  // First apply metal
  applyMaterialProfileToMesh(mesh, 'metal', { metal: 'yellow_gold' });
  assert.notStrictEqual(mesh.material, originalMat);

  // Then revert to unassigned
  applyMaterialProfileToMesh(mesh, 'unassigned', {});
  assert.strictEqual(mesh.material, originalMat);
});

test('materialProfileBridge: switching metals does not change gemstone materials', () => {
  const gemMesh = new THREE.Mesh(
    new THREE.BufferGeometry(),
    new THREE.MeshBasicMaterial({ name: 'gem' })
  );
  applyMaterialProfileToMesh(gemMesh, 'centerGem', { centerGem: 'diamond' });
  const initialGemMat = gemMesh.material;

  const metalMesh = new THREE.Mesh(
    new THREE.BufferGeometry(),
    new THREE.MeshBasicMaterial({ name: 'metal' })
  );
  applyMaterialProfileToMesh(metalMesh, 'metal', { metal: 'white_gold' });

  // Now change metal to rose gold
  applyMaterialProfileToMesh(metalMesh, 'metal', { metal: 'rose_gold' });

  // Gem mesh material is unchanged
  assert.strictEqual(gemMesh.material, initialGemMat);
  // Metal mesh material is updated
  assert.strictEqual((metalMesh.material as THREE.MeshPhysicalMaterial).name, 'Metal_rose_gold');
});
