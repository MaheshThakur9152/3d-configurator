import test from 'node:test';
import assert from 'node:assert';
import * as THREE from 'three';
import { JewelleryEnvironmentResources } from '../../src/features/shared-viewer/types/jewelleryViewer.types.ts';
import { applyMaterialProfileToMesh } from '../../src/features/shared-viewer/lib/materialProfileBridge.ts';
import { createDiamondShaderMaterial } from '../../src/features/diamond-shader/DiamondShaderMaterial.ts';

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

test('environmentTextureContract: fallback path separates 2D equirectangular fallback from PMREM CubeUV fallback', () => {
  // Simulating the fallback environment state
  const mockPmrem = new THREE.DataTexture(new Uint8Array([100, 100, 100, 255]), 1, 1);
  mockPmrem.name = 'cube_uv_pmrem_fallback';

  const mockEquirect = new THREE.DataTexture(new Uint8Array([200, 200, 200, 255]), 1, 1);
  mockEquirect.name = 'equirectangular_2d_fallback';
  mockEquirect.mapping = THREE.EquirectangularReflectionMapping;

  const fallbackEnvs: JewelleryEnvironmentResources = {
    metalPmrem: mockPmrem,
    gemPmrem: mockPmrem,
    gemEquirectangular: mockEquirect,
    proceduralFallback: true,
  };

  assert.notStrictEqual(fallbackEnvs.gemEquirectangular, fallbackEnvs.metalPmrem);
  assert.strictEqual(fallbackEnvs.gemEquirectangular.mapping, THREE.EquirectangularReflectionMapping);
});

test('diamondShader: initializes all required optical uniforms including facetExtinction and keyLightDir', () => {
  const dummyTex = new THREE.DataTexture(new Uint8Array([255, 255, 255, 255]), 1, 1);
  const mat = createDiamondShaderMaterial({
    envMap: dummyTex,
    facetExtinction: 0.35,
    boost: 1.45,
  });

  assert.strictEqual(mat.isShaderMaterial, true);
  assert.strictEqual(mat.uniforms.facetExtinction.value, 0.35);
  assert.strictEqual(mat.uniforms.boost.value, 1.45);
  assert.strictEqual(mat.uniforms.refractiveIndex.value, 2.417);
  assert.strictEqual(mat.uniforms.dispersion.value, 0.044);
  assert.strictEqual(mat.uniforms.keyLightDir.value instanceof THREE.Vector3, true);
  assert.strictEqual(mat.uniforms.envMap.value, dummyTex);
});
