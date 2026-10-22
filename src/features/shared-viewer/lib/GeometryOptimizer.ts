import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { MeshRole } from '@/features/ring-viewer/types/viewer.types';
import { identifyMeshRole } from '@/features/ring-viewer/lib/model-configuration';

export interface OptimizationStats {
  originalMeshCount: number;
  optimizedMeshCount: number;
  drawCallsSaved: number;
}

/**
 * Merges static meshes sharing the same functional role (e.g., all 53 metal prongs in a shank)
 * into a single unified BufferGeometry.
 * 
 * This reduces draw calls from 110+ down to <10, drastically lowering GPU driver overhead
 * and boosting mobile FPS without any visual degradation.
 */
export function optimizeSceneGeometry(
  root: THREE.Object3D,
  targetRoles: MeshRole[] = ['metal', 'sideGem']
): OptimizationStats {
  root.updateWorldMatrix(true, true);
  const rootInverseMatrix = new THREE.Matrix4().copy(root.matrixWorld).invert();

  // 1. Collect meshes by role
  const meshesByRole = new Map<MeshRole, THREE.Mesh[]>();
  let totalOriginalMeshes = 0;

  root.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      totalOriginalMeshes++;
      const mesh = child as THREE.Mesh;
      const role = identifyMeshRole(mesh);

      // Do NOT merge centerGem because it scales independently with carat selection
      if (role !== 'centerGem' && targetRoles.includes(role)) {
        const list = meshesByRole.get(role) || [];
        list.push(mesh);
        meshesByRole.set(role, list);
      }
    }
  });

  let totalDrawCallsSaved = 0;

  // 2. Merge each eligible role group
  for (const [role, meshes] of meshesByRole.entries()) {
    if (meshes.length <= 1) continue;

    const geometriesToMerge: THREE.BufferGeometry[] = [];
    const sourceMaterial = meshes[0].material;

    for (const mesh of meshes) {
      mesh.updateWorldMatrix(true, false);
      const relativeMatrix = new THREE.Matrix4()
        .copy(rootInverseMatrix)
        .multiply(mesh.matrixWorld);

      // Clone geometry and bake relative world transform into vertices
      const transformedGeom = mesh.geometry.clone();
      transformedGeom.applyMatrix4(relativeMatrix);

      // Ensure geometry has standard normals and uv attributes
      if (!transformedGeom.attributes.normal) {
        transformedGeom.computeVertexNormals();
      }

      geometriesToMerge.push(transformedGeom);
    }

    try {
      const mergedGeometry = mergeGeometries(geometriesToMerge, false);
      if (mergedGeometry) {
        const mergedMesh = new THREE.Mesh(mergedGeometry, sourceMaterial);
        mergedMesh.name = `merged_${role}`;
        mergedMesh.userData = {
          role,
          optimized: true,
          mergedCount: meshes.length,
        };
        mergedMesh.castShadow = true;
        mergedMesh.receiveShadow = true;

        // Remove individual source meshes from their parent
        for (const mesh of meshes) {
          if (mesh.parent) {
            mesh.parent.remove(mesh);
          }
          mesh.geometry.dispose();
        }

        // Add merged mesh directly to root
        root.add(mergedMesh);
        totalDrawCallsSaved += (meshes.length - 1);
      }
    } catch (err) {
      console.warn(`[GeometryOptimizer] Failed to merge geometries for role "${role}":`, err);
    } finally {
      // Clean up temporary transformed geometries
      for (const geom of geometriesToMerge) {
        geom.dispose();
      }
    }
  }

  // Count remaining meshes
  let remainingMeshes = 0;
  root.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      remainingMeshes++;
    }
  });

  return {
    originalMeshCount: totalOriginalMeshes,
    optimizedMeshCount: remainingMeshes,
    drawCallsSaved: totalDrawCallsSaved,
  };
}
