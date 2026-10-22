import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export interface FramingResult {
  center: THREE.Vector3;
  radius: number;
  boundingBox: THREE.Box3;
}

/**
 * Calculates tight bounding boxes for arbitrary 3D jewelry models
 * and positions perspective cameras to frame the asset naturally.
 */
export function autoFrameModel(
  object: THREE.Object3D,
  camera: THREE.PerspectiveCamera,
  controls?: OrbitControls
): FramingResult {
  const box = new THREE.Box3().setFromObject(object);

  // If bounding box is empty or degenerate
  if (box.isEmpty()) {
    box.set(new THREE.Vector3(-1, -1, -1), new THREE.Vector3(1, 1, 1));
  }

  const center = new THREE.Vector3();
  box.getCenter(center);

  const sphere = new THREE.Sphere();
  box.getBoundingSphere(sphere);
  const radius = Math.max(sphere.radius, 0.5);

  // Center the model at origin for smooth orbiting
  object.position.sub(center);

  // Calculate required camera distance for the 15° telephoto FOV
  const fovRad = (camera.fov * Math.PI) / 180;
  // Distance to fit sphere height: d = radius / sin(fov/2)
  const fitDistance = (radius / Math.sin(fovRad / 2)) * 1.15;

  // Position camera at an elevated front-three-quarter angle
  camera.position.set(0, fitDistance * 0.45, fitDistance * 0.9);
  camera.near = fitDistance * 0.01;
  camera.far = fitDistance * 10;
  camera.updateProjectionMatrix();

  if (controls) {
    controls.target.set(0, 0, 0);
    controls.minDistance = fitDistance * 0.2;
    controls.maxDistance = fitDistance * 3.5;
    controls.update();
  }

  return {
    center,
    radius,
    boundingBox: box,
  };
}
