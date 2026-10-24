import { MeshStandardMaterial, Color } from 'three';
import { MaterialFactory, MaterialId, PbrMetalParams } from '../types.js';

export const METAL_PRESETS: Record<string, PbrMetalParams> = {
  '18K_YELLOW_GOLD_HIGH_POLISH': {
    color: '#E2BF7F',
    metalness: 1.0,
    roughness: 0.02,
    envMapIntensity: 1.0
  },
  '18K_WHITE_GOLD_HIGH_POLISH': {
    color: '#F4F4F6',
    metalness: 0.92,
    roughness: 0.04,
    envMapIntensity: 1.0
  },
  '18K_ROSE_GOLD_HIGH_POLISH': {
    color: '#E8A399',
    metalness: 1.0,
    roughness: 0.03,
    envMapIntensity: 1.0
  },
  'PLATINUM_950_HIGH_POLISH': {
    color: '#E5E5E8',
    metalness: 0.95,
    roughness: 0.02,
    envMapIntensity: 1.0
  },
  '18K_YELLOW_GOLD_SATIN_BRUSHED': {
    color: '#DFBA76',
    metalness: 0.90,
    roughness: 0.28,
    envMapIntensity: 0.9
  },
  '18K_WHITE_GOLD_SATIN_BRUSHED': {
    color: '#EAEAEF',
    metalness: 0.88,
    roughness: 0.28,
    envMapIntensity: 0.9
  },
  '18K_ROSE_GOLD_SATIN_BRUSHED': {
    color: '#E59F94',
    metalness: 0.90,
    roughness: 0.28,
    envMapIntensity: 0.9
  },
  'PLATINUM_950_SATIN_BRUSHED': {
    color: '#DFDFE4',
    metalness: 0.92,
    roughness: 0.26,
    envMapIntensity: 0.9
  }
};

export class PbrMetalMaterialFactory implements MaterialFactory<PbrMetalParams> {
  public id: MaterialId = 'metal.pbr.v1';
  public family: 'metal' = 'metal';

  public create(params: PbrMetalParams): MeshStandardMaterial {
    const mat = new MeshStandardMaterial({
      color: new Color(params.color),
      metalness: params.metalness,
      roughness: params.roughness,
      envMapIntensity: params.envMapIntensity ?? 1.0
    });
    mat.name = 'PbrMetalMaterial';
    return mat;
  }

  public update(material: MeshStandardMaterial, params: Partial<PbrMetalParams>): void {
    if (params.color !== undefined) {
      material.color.set(params.color);
    }
    if (params.metalness !== undefined) {
      material.metalness = params.metalness;
    }
    if (params.roughness !== undefined) {
      material.roughness = params.roughness;
    }
    if (params.envMapIntensity !== undefined) {
      material.envMapIntensity = params.envMapIntensity;
    }
    material.needsUpdate = true;
  }

  public dispose(material: MeshStandardMaterial): void {
    material.dispose();
  }
}
