import test from 'node:test';
import assert from 'node:assert';
import * as THREE from 'three';
import { identifyMeshRole } from '../../src/features/shared-viewer/lib/identifyMeshRole.ts';

test('identifyMeshRole: classifies Diamond_Oval as centerGem', () => {
  const mesh = new THREE.Mesh(
    new THREE.BufferGeometry(),
    new THREE.MeshBasicMaterial({ name: 'Default_Material' })
  );
  mesh.name = 'Diamond_Oval';

  const role = identifyMeshRole(mesh);
  assert.strictEqual(role, 'centerGem');
});

test('identifyMeshRole: classifies Gem 01 material as centerGem', () => {
  const mesh = new THREE.Mesh(
    new THREE.BufferGeometry(),
    new THREE.MeshBasicMaterial({ name: 'Gem 01' })
  );
  mesh.name = 'Object_42';

  const role = identifyMeshRole(mesh);
  assert.strictEqual(role, 'centerGem');
});

test('identifyMeshRole: does NOT misclassify mesh_21 as gemstone if material is Metal', () => {
  const mesh = new THREE.Mesh(
    new THREE.BufferGeometry(),
    new THREE.MeshBasicMaterial({ name: 'Metal_Yellow' })
  );
  mesh.name = 'mesh_21';

  const role = identifyMeshRole(mesh);
  assert.strictEqual(role, 'metal');
});

test('identifyMeshRole: explicit designer assignment overrides heuristics', () => {
  const mesh = new THREE.Mesh(
    new THREE.BufferGeometry(),
    new THREE.MeshBasicMaterial({ name: 'Metal 01' })
  );
  mesh.name = 'shank_main';
  // Designer manually assigned this to prongs
  mesh.userData.isDesignerAssigned = true;
  mesh.userData.assignedRole = 'prongs';

  const role = identifyMeshRole(mesh);
  assert.strictEqual(role, 'prongs');
});

test('identifyMeshRole: manifest role overrides heuristics', () => {
  const mesh = new THREE.Mesh(
    new THREE.BufferGeometry(),
    new THREE.MeshBasicMaterial({ name: 'Default_Material' })
  );
  mesh.name = 'Custom_Stone_A';

  const manifestRoles = {
    Custom_Stone_A: 'centerGem' as const,
  };

  const role = identifyMeshRole(mesh, 'unassigned', manifestRoles);
  assert.strictEqual(role, 'centerGem');
});

test('identifyMeshRole: generic unknown mesh defaults to unassigned', () => {
  const mesh = new THREE.Mesh(
    new THREE.BufferGeometry(),
    new THREE.MeshBasicMaterial({ name: 'Default_Material' })
  );
  mesh.name = 'generic_box_1';

  const role = identifyMeshRole(mesh, 'unassigned');
  assert.strictEqual(role, 'unassigned');
});

test('identifyMeshRole: classifies pavé and side stones as sideGem', () => {
  const meshPave = new THREE.Mesh(
    new THREE.BufferGeometry(),
    new THREE.MeshBasicMaterial({ name: 'Default' })
  );
  meshPave.name = 'pave_diamond_left_01';
  assert.strictEqual(identifyMeshRole(meshPave), 'sideGem');

  const meshGem02 = new THREE.Mesh(
    new THREE.BufferGeometry(),
    new THREE.MeshBasicMaterial({ name: 'Gem 02' })
  );
  meshGem02.name = 'stone_acc';
  assert.strictEqual(identifyMeshRole(meshGem02), 'sideGem');
});
