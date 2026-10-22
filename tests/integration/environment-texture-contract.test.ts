import test from 'node:test';
import assert from 'node:assert';
import * as THREE from 'three';
import { JewelleryEnvironmentResources } from '../../src/features/shared-viewer/types/jewelleryViewer.types.ts';
import { applyMaterialProfileToMesh } from '../../src/features/shared-viewer/lib/materialProfileBridge.ts';

test('environmentTextureContract: enforces strictly separated metal PMREM and gem equirectangular textures', () => {
  // Create mock environment textures
  const metalPmremTex = new THREE.DataTexture(new Uint8Array([255, 255, 255, 255]), 1, 1);
  metalPmremTex.name = 'env_metal_studio_pmrem';

  const gemEquirectTex = new THREE.DataTexture(new Uint8Array([200, 220, 255, 255]), 1, 1);
  gemEquirectTex.name = 'env_gem_sparkle_equirectangular';

  const gemPmremTex = new THREE.DataTexture(new Uint8Array([180, 200, 240, 255]), 1, 1);
  gemPmremTex.name = 'env_gem_sparkle_pmrem';

  const envs: JewelleryEnvironmentResources = {
    metalPmrem: metalPmremTex,
    gemPmrem: gemPmremTex,
    gemEquirectangular: gemEquirectTex,
    proceduralFallback: false,
  };

  // 1. Verify contract properties exist and are distinct
  assert.notStrictEqual(envs.metalPmrem, envs.gemEquirectangular);
  assert.strictEqual(envs.gemEquirectangular.name, 'env_gem_sparkle_equirectangular');

  // 2. Center stone receiving the gem equirectangular texture
  const centerMesh = new THREE.Mesh(new THREE.BufferGeometry(), new THREE.MeshBasicMaterial());
  applyMaterialProfileToMesh(centerMesh, 'centerGem', {
    centerGem: 'diamond',
    environments: envs,
  });

  // Verify material was created with the gem environment
  const shaderMat = centerMesh.material as THREE.ShaderMaterial;
  assert.strictEqual(shaderMat.uniforms.envMap.value, gemEquirectTex);
  assert.notStrictEqual(shaderMat.uniforms.envMap.value, metalPmremTex);

  // 3. Metal mesh receiving the metal PMREM texture
  const metalMesh = new THREE.Mesh(new THREE.BufferGeometry(), new THREE.MeshBasicMaterial());
  applyMaterialProfileToMesh(metalMesh, 'metal', {
    metal: 'white_gold',
    environments: envs,
  });

  const metalMat = metalMesh.material as THREE.MeshPhysicalMaterial;
  assert.strictEqual(metalMat.envMap, metalPmremTex);
  assert.notStrictEqual(metalMat.envMap, gemEquirectTex);
});
