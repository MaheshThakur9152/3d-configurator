import { useEffect, useRef, useState, RefObject } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { ConfiguratorState } from '@/features/configurator/types/configurator.types';
import { setupViewer } from '../lib/viewer-setup';
import { loadRingModels } from '../lib/model-loader';
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

  const shankMeshGroup = useRef<THREE.Group | null>(null);
  const headMeshGroup = useRef<THREE.Group | null>(null);
  const eternityMeshGroup = useRef<THREE.Group | null>(null);

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

    let isDisposed = false;

    // Load models
    loadRingModels()
      .then(({ shankScene, headScene, eternityScene }) => {
        if (isDisposed) return;

        shankMeshGroup.current = shankScene;
        headMeshGroup.current = headScene;
        eternityMeshGroup.current = eternityScene;

        ringGroup.add(shankScene);
        ringGroup.add(headScene);
        ringGroup.add(eternityScene);

        syncRingState(state, shankScene, headScene, eternityScene);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load ring models:', err);
        setIsLoading(false);
      });

    // Render loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
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
    };

    window.addEventListener('resize', handleResize);

    return () => {
      isDisposed = true;
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
      pmremGenerator.dispose();
      renderer.dispose();
    };
  }, []);

  // Sync materials & scales on state changes
  useEffect(() => {
    syncRingState(
      state,
      shankMeshGroup.current,
      headMeshGroup.current,
      eternityMeshGroup.current
    );
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
