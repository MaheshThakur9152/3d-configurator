import test from 'node:test';
import assert from 'node:assert';
import * as THREE from 'three';
import { optimizeSceneGeometry } from '../../src/features/shared-viewer/lib/GeometryOptimizer.ts';

test('geometryOptimizer: does NOT merge centerGem mesh', () => {
  const root = new THREE.Group();

  const centerMesh = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshBasicMaterial()
  );
  centerMesh.name = 'Diamond_Oval';
  centerMesh.userData.role = 'centerGem';
  root.add(centerMesh);

  // Add 3 metal prongs
  for (let i = 0; i < 3; i++) {
    const prong = new THREE.Mesh(
      new THREE.BoxGeometry(0.2, 0.2, 0.2),
      new THREE.MeshBasicMaterial()
    );
    prong.name = `prong_${i}`;
    prong.userData.role = 'metal';
    prong.position.set(i, 0, 0);
    root.add(prong);
  }

  const stats = optimizeSceneGeometry(root, ['metal']);

  // Original meshes: 1 center + 3 prongs = 4
  assert.strictEqual(stats.originalMeshCount, 4);

  // Center stone must remain individual and not be merged
  let foundCenter = false;
  root.traverse((child) => {
    if (child.name === 'Diamond_Oval') {
      foundCenter = true;
    }
  });
  assert.strictEqual(foundCenter, true);

  // The 3 prongs should be merged into 1 merged_metal mesh
  let mergedMetalCount = 0;
  root.traverse((child) => {
    if (child.name === 'merged_metal') {
      mergedMetalCount++;
    }
  });
  assert.strictEqual(mergedMetalCount, 1);
  assert.strictEqual(stats.drawCallsSaved, 2);
});
