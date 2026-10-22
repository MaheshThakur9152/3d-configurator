import * as THREE from 'three';
import { SemanticMeshRole } from '../types/jewelleryViewer.types';

/**
 * Shared Semantic Mesh Role Classifier
 *
 * Precedence Order:
 * 1. Explicit designer assignment in mesh.userData.isDesignerAssigned
 * 2. Product Manifest explicit role mapping (by mesh name or id)
 * 3. Existing mesh.userData.assignedRole / mesh.userData.role
 * 4. Automatic heuristic detection based on material & mesh node names
 * 5. Fallback to defaultRole (defaults to 'unassigned')
 */
export function identifyMeshRole(
  mesh: THREE.Mesh,
  defaultRole: SemanticMeshRole = 'unassigned',
  manifestRoles?: Record<string, SemanticMeshRole>
): SemanticMeshRole {
  // 1. Explicit designer assignment takes absolute precedence
  if (mesh.userData.isDesignerAssigned && mesh.userData.assignedRole) {
    return mesh.userData.assignedRole as SemanticMeshRole;
  }

  // 2. Manifest explicit mappings
  if (manifestRoles) {
    if (mesh.name && manifestRoles[mesh.name]) {
      return manifestRoles[mesh.name];
    }
    if (mesh.userData.id && manifestRoles[mesh.userData.id]) {
      return manifestRoles[mesh.userData.id];
    }
  }

  // 3. UserData assignedRole / role
  if (mesh.userData.assignedRole) {
    return mesh.userData.assignedRole as SemanticMeshRole;
  }
  if (mesh.userData.role) {
    return mesh.userData.role as SemanticMeshRole;
  }

  // 4. Heuristic classification based on material and node name
  const mat = mesh.material as THREE.Material;
  const matName = (mat?.name || '').toLowerCase();
  const nodeName = (mesh.name || '').toLowerCase();

  // Center gemstone identification
  const isCenterName =
    nodeName.includes('diamond_oval') ||
    nodeName.includes('center') ||
    nodeName.includes('main_gem') ||
    nodeName.includes('main_stone') ||
    nodeName.includes('solitaire');

  const isHeadMesh21 =
    (mesh.name === 'mesh_21' || mesh.name === 'Diamond_Oval') &&
    !matName.includes('metal');

  if (matName === 'gem 01' || isCenterName || isHeadMesh21) {
    return 'centerGem';
  }

  // Side / pavé diamond identification
  const isSideName =
    matName === 'gem 02' ||
    nodeName.includes('pave') ||
    nodeName.includes('side') ||
    nodeName.includes('halo') ||
    nodeName.includes('accent') ||
    (matName.includes('gem') && !matName.includes('metal')) ||
    (matName.includes('diam') && !matName.includes('metal'));

  if (isSideName) {
    return 'sideGem';
  }

  // Metal / setting / prongs / band identification
  const isMetalName =
    matName.includes('metal') ||
    matName.includes('gold') ||
    matName.includes('plat') ||
    nodeName.includes('metal') ||
    nodeName.includes('shank') ||
    nodeName.includes('band') ||
    nodeName.includes('prong') ||
    nodeName.includes('setting');

  if (isMetalName) {
    return 'metal';
  }

  return defaultRole;
}
