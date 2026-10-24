import React, { useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import { Mesh } from 'three';
import { useConfiguratorStore } from '../../store/useConfiguratorStore.js';
import { MaterialRegistry } from '../../renderer/materials/registry.js';
import { METAL_PRESETS } from '../../renderer/materials/metals/PbrMetalMaterial.js';
import { GEMSTONE_PRESETS } from '../../renderer/materials/diamonds/RefractionDiamondMaterial.js';

interface ModelRendererProps {
  modelUrl: string;
}

export const ModelRenderer: React.FC<ModelRendererProps> = ({ modelUrl }) => {
  const { scene } = useGLTF(modelUrl);
  const { config } = useConfiguratorStore();

  // Resolve Metal Materials from Registry
  const shankMetalParams = useMemo(() => {
    const key = `${config.metalType}_${config.metalFinish}`;
    return METAL_PRESETS[key] || METAL_PRESETS['18K_YELLOW_GOLD_HIGH_POLISH'];
  }, [config.metalType, config.metalFinish]);

  const settingMetalParams = useMemo(() => {
    const key = `${config.settingMetalType}_HIGH_POLISH`;
    return METAL_PRESETS[key] || METAL_PRESETS['18K_WHITE_GOLD_HIGH_POLISH'];
  }, [config.settingMetalType]);

  const gemParams = useMemo(() => {
    return GEMSTONE_PRESETS[config.gemstoneType] || GEMSTONE_PRESETS['DIAMOND_WHITE'];
  }, [config.gemstoneType]);

  const shankMaterial = useMemo(() => {
    return MaterialRegistry.getMaterial('metal.pbr.v1', shankMetalParams, 'shank_mat');
  }, [shankMetalParams]);

  const settingMaterial = useMemo(() => {
    return MaterialRegistry.getMaterial('metal.pbr.v1', settingMetalParams, 'setting_mat');
  }, [settingMetalParams]);

  const diamondMaterial = useMemo(() => {
    return MaterialRegistry.getMaterial('diamond.refraction.v1', gemParams, 'gem_mat');
  }, [gemParams]);

  // Center diamond volumetric scale based on Carat weight
  const caratScale = useMemo(() => {
    return Math.cbrt(config.caratWeight / 1.0);
  }, [config.caratWeight]);

  // Apply materials across the scene graph
  useMemo(() => {
    scene.traverse((node) => {
      if ((node as Mesh).isMesh) {
        const mesh = node as Mesh;
        const name = mesh.name.toLowerCase();

        // 1. Shank Band
        if (name.includes('gold') || name.includes('alliance') || name.includes('shank')) {
          mesh.material = shankMaterial;
          mesh.castShadow = true;
          mesh.receiveShadow = true;
        }
        // 2. Setting / Prongs / Basket
        else if (name.includes('silver') || name.includes('entourage') || name.includes('setting')) {
          mesh.material = settingMaterial;
          mesh.castShadow = true;
          mesh.receiveShadow = true;
        }
        // 3. Center Diamond
        else if (name === 'object' || name === 'diamonds' || name.startsWith('diamonds')) {
          mesh.material = diamondMaterial;
          mesh.castShadow = false; // Gemstones don't cast hard opaque shadows
          // Apply dynamic carat scale
          mesh.scale.set(caratScale, caratScale, caratScale);
        }
        // 4. Side / Pavé Accent Diamonds
        else if (name.includes('dia') || name.includes('cuchion')) {
          mesh.material = diamondMaterial;
          mesh.castShadow = false;
        }
      }
    });
  }, [scene, shankMaterial, settingMaterial, diamondMaterial, caratScale]);

  return (
    <primitive
      object={scene}
      position={[0, -0.2, 0]}
      rotation={[0, 0, 0]}
    />
  );
};
