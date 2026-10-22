import { useEffect, useRef, useState, RefObject } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { ConfiguratorState } from '@/features/configurator/types/configurator.types';
import { setupViewer } from '../lib/viewer-setup';
import { loadRingModels, loadEternityModel } from '../lib/model-loader';
import { syncRingState } from '../lib/model-configuration';

interface UseRingViewerReturn {
  containerRef: RefObject<HTMLDivElement>;
  canvasRef: RefObject<HTMLCanvasElement>;
  isLoading: boolean;
  hasInteracted: boolean;
  setHasInteracted: (val: boolean) => void;
}

export function useRingViewer(state: ConfiguratorState): UseRingViewerReturn {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [hasInteracted, setHasInteracted] = useState(false);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const ringGroupRef = useRef<THREE.Group | null>(null);

  const shankMeshGroup = useRef<THREE.Group | null>(null);
  const headMeshGroup = useRef<THREE.Group | null>(null);
  const eternityMeshGroup = useRef<THREE.Group | null>(null);
  const currentEternityUrl = useRef<string>('/assets/models/et_plain_03.glb');

  // Request render helper
  const requestRenderRef = useRef<() => void>(() => {});

  // Initialize scene, camera, lights, and load models
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const {
      scene,
      camera,
      renderer,
      controls,
      ringGroup,
      pmremGenerator,
    } = setupViewer(canvasRef.current, width, height);

    sceneRef.current = scene;
    cameraRef.current = camera;
    rendererRef.current = renderer;
    controlsRef.current = controls;
    ringGroupRef.current = ringGroup;

    let isDisposed = false;
    let renderRequested = true;

    const triggerRender = () => {
      renderRequested = true;
    };
    requestRenderRef.current = triggerRender;

    controls.addEventListener('change', triggerRender);

    // Load initial models
    loadRingModels()
      .then(({ shankScene, headScene, eternityScene }) => {
        if (isDisposed) return;

        shankMeshGroup.current = shankScene;
        headMeshGroup.current = headScene;
        eternityMeshGroup.current = eternityScene;

        ringGroup.add(shankScene);
        ringGroup.add(headScene);
        ringGroup.add(eternityScene);

        syncRingState(state, shankScene, headScene, eternityScene, scene.environment);
        setIsLoading(false);
        triggerRender();
      })
      .catch((err) => {
        console.error('Failed to load ring models:', err);
        setIsLoading(false);
      });

    // Smart render loop: on-demand rendering with damping continuation
    let animId: number;
    let idleFrames = 0;

    const animate = () => {
      animId = requestAnimationFrame(animate);

      // Check if controls damping is still active
      const dampingActive = controls.update();

      if (dampingActive || renderRequested) {
        renderer.render(scene, camera);
        renderRequested = false;
        idleFrames = 0;
      } else {
        // Idle: render a few buffer frames after motion ceases to guarantee settle
        if (idleFrames < 5) {
          renderer.render(scene, camera);
          idleFrames++;
        }
      }
    };
    animate();

    // Resize handler
    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      const factor = w < 768 ? Math.max(1.0, (768 / w) * 0.88) : 1.0;
      cameraRef.current.position.set(-0.024 * factor, 11.51 * factor, -4.22 * factor);
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
      triggerRender();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      isDisposed = true;
      window.removeEventListener('resize', handleResize);
      controls.removeEventListener('change', triggerRender);
      cancelAnimationFrame(animId);
      pmremGenerator.dispose();
      renderer.dispose();
    };
  }, []);

  // Handle eternity band model swapping when option changes
  useEffect(() => {
    const targetUrl = state.selectedEternity?.modelUrl;
    if (!targetUrl || targetUrl === currentEternityUrl.current || !ringGroupRef.current) return;

    loadEternityModel(targetUrl)
      .then((newEternityScene) => {
        if (!ringGroupRef.current) return;

        // Remove old eternity scene
        if (eternityMeshGroup.current) {
          ringGroupRef.current.remove(eternityMeshGroup.current);
        }

        eternityMeshGroup.current = newEternityScene;
        currentEternityUrl.current = targetUrl;
        newEternityScene.visible = state.eternityActive;
        ringGroupRef.current.add(newEternityScene);

        syncRingState(
          state,
          shankMeshGroup.current,
          headMeshGroup.current,
          newEternityScene,
          sceneRef.current?.environment
        );
        requestRenderRef.current();
      })
      .catch((err) => console.error('Error switching eternity band:', err));
  }, [state.selectedEternity]);

  // Sync materials & scales on state changes
  useEffect(() => {
    syncRingState(
      state,
      shankMeshGroup.current,
      headMeshGroup.current,
      eternityMeshGroup.current,
      sceneRef.current?.environment
    );
    requestRenderRef.current();
  }, [
    state.selectedMetal,
    state.selectedCenterstone,
    state.selectedSideDiamond,
    state.selectedCarat,
    state.eternityActive,
  ]);

  return {
    containerRef,
    canvasRef,
    isLoading,
    hasInteracted,
    setHasInteracted,
  };
}
