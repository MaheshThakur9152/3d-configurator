import * as THREE from 'three';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { EXRLoader } from 'three/examples/jsm/loaders/EXRLoader.js';
import { JewelleryEnvironmentResources } from '../types/jewelleryViewer.types';

let cachedEnvironments: JewelleryEnvironmentResources | null = null;
let loadPromise: Promise<JewelleryEnvironmentResources> | null = null;

/**
 * Loads authentic studio HDR and EXR environment maps for precious metals
 * and diamond optical scintillation.
 *
 * Enforces the strictly typed JewelleryEnvironmentResources contract:
 * - metalPmrem: Pre-filtered PMREM CubeUV texture for MeshPhysicalMaterial precious metals.
 * - gemPmrem: Pre-filtered PMREM CubeUV texture for accent/side diamonds.
 * - gemEquirectangular: Raw spherical equirectangular EXR texture for the custom diamond shader.
 */
export async function loadJewelleryEnvironments(
  pmremGenerator: THREE.PMREMGenerator
): Promise<JewelleryEnvironmentResources> {
  if (cachedEnvironments) {
    return cachedEnvironments;
  }

  if (loadPromise) {
    return loadPromise;
  }

  loadPromise = (async () => {
    try {
      const rgbeLoader = new RGBELoader();
      const exrLoader = new EXRLoader();

      const [metalHdr, gemExr] = await Promise.all([
        rgbeLoader.loadAsync('/assets/environments/env_metal_studio.hdr'),
        exrLoader.loadAsync('/assets/environments/env_gem_sparkle.exr'),
      ]);

      metalHdr.mapping = THREE.EquirectangularReflectionMapping;
      gemExr.mapping = THREE.EquirectangularReflectionMapping;

      const metalPmrem = pmremGenerator.fromEquirectangular(metalHdr).texture;
      const gemPmrem = pmremGenerator.fromEquirectangular(gemExr).texture;

      cachedEnvironments = {
        metalPmrem,
        gemPmrem,
        gemEquirectangular: gemExr, // Correctly references authentic gem EXR, NOT metal HDR!
        proceduralFallback: false,
      };

      return cachedEnvironments;
    } catch (err) {
      console.warn(
        '[JewelleryEnvironment] Failed to load studio HDR/EXR assets, falling back to procedural studio environment:',
        err
      );

      // Create deterministic procedural fallback textures
      const fallbackScene = new THREE.Scene();
      fallbackScene.background = new THREE.Color(0x9aa0a6);

      const addFallbackPanel = (w: number, h: number, pos: [number, number, number], intensity: number) => {
        const mesh = new THREE.Mesh(
          new THREE.PlaneGeometry(w, h),
          new THREE.MeshBasicMaterial({
            color: new THREE.Color(intensity, intensity, intensity),
            side: THREE.DoubleSide,
          })
        );
        mesh.position.set(...pos);
        mesh.lookAt(0, 0, 0);
        fallbackScene.add(mesh);
      };

      addFallbackPanel(40, 40, [0, 25, 0], 2.0);
      addFallbackPanel(30, 30, [-15, 15, -15], 1.8);
      addFallbackPanel(30, 30, [15, 15, -15], 1.8);

      const fallbackTexture = pmremGenerator.fromScene(fallbackScene).texture;

      cachedEnvironments = {
        metalPmrem: fallbackTexture,
        gemPmrem: fallbackTexture,
        gemEquirectangular: fallbackTexture,
        proceduralFallback: true,
      };

      return cachedEnvironments;
    } finally {
      loadPromise = null;
    }
  })();

  return loadPromise;
}

/**
 * Disposes cached environment textures.
 */
export function disposeJewelleryEnvironments(): void {
  if (cachedEnvironments) {
    if (cachedEnvironments.metalPmrem) cachedEnvironments.metalPmrem.dispose();
    if (cachedEnvironments.gemPmrem) cachedEnvironments.gemPmrem.dispose();
    if (cachedEnvironments.gemEquirectangular) cachedEnvironments.gemEquirectangular.dispose();
    cachedEnvironments = null;
  }
}
