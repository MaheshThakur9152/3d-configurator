import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export interface RenderSchedulerOptions {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.Camera;
  controls?: OrbitControls;
  onRender?: () => void;
}

export interface RenderScheduler {
  requestRender: () => void;
  start: () => void;
  stop: () => void;
}

/**
 * Creates an on-demand render scheduler that only renders when the scene is dirty
 * or OrbitControls damping is actively transitioning.
 */
export function createRenderScheduler(options: RenderSchedulerOptions): RenderScheduler {
  const { renderer, scene, camera, controls, onRender } = options;

  let animId: number | null = null;
  let renderRequested = true;
  let idleFrames = 0;
  let isRunning = false;

  const requestRender = () => {
    renderRequested = true;
    idleFrames = 0;
  };

  if (controls) {
    controls.addEventListener('change', requestRender);
  }

  const loop = () => {
    if (!isRunning) return;
    animId = requestAnimationFrame(loop);

    const dampingActive = controls ? controls.update() : false;

    if (dampingActive || renderRequested) {
      renderer.render(scene, camera);
      renderRequested = false;
      idleFrames = 0;
      onRender?.();
    } else if (idleFrames < 5) {
      // Settle buffer frames after movement stops
      renderer.render(scene, camera);
      idleFrames++;
      onRender?.();
    }
  };

  const start = () => {
    if (isRunning) return;
    isRunning = true;
    renderRequested = true;
    idleFrames = 0;
    loop();
  };

  const stop = () => {
    isRunning = false;
    if (animId !== null) {
      cancelAnimationFrame(animId);
      animId = null;
    }
    if (controls) {
      controls.removeEventListener('change', requestRender);
    }
  };

  return {
    requestRender,
    start,
    stop,
  };
}
