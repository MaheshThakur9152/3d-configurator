import { MeshPhysicalMaterial, Color } from 'three';
import { MaterialFactory, MaterialId, DiamondParams } from '../types.js';

export const GEMSTONE_PRESETS: Record<string, DiamondParams> = {
  DIAMOND_WHITE: {
    color: '#FFFFFF',
    ior: 2.42,
    dispersion: 0.015,
    bounces: 5,
    absorption: 0.0,
    envMapIntensity: 1.5
  },
  DIAMOND_YELLOW: {
    color: '#FFE853',
    ior: 2.42,
    dispersion: 0.012,
    bounces: 5,
    absorption: 0.3,
    envMapIntensity: 1.4
  },
  DIAMOND_PINK: {
    color: '#FFAED7',
    ior: 2.42,
    dispersion: 0.012,
    bounces: 5,
    absorption: 0.3,
    envMapIntensity: 1.4
  },
  DIAMOND_BLUE: {
    color: '#65D5FF',
    ior: 2.42,
    dispersion: 0.012,
    bounces: 5,
    absorption: 0.2,
    envMapIntensity: 1.4
  },
  RUBY: {
    color: '#E0115F',
    ior: 1.77,
    dispersion: 0.008,
    bounces: 3,
    absorption: 1.2,
    envMapIntensity: 1.2
  },
  SAPPHIRE: {
    color: '#0F52BA',
    ior: 1.77,
    dispersion: 0.008,
    bounces: 3,
    absorption: 1.0,
    envMapIntensity: 1.2
  },
  EMERALD: {
    color: '#50C878',
    ior: 1.58,
    dispersion: 0.006,
    bounces: 3,
    absorption: 0.8,
    envMapIntensity: 1.1
  }
};

export class RefractionDiamondMaterialFactory implements MaterialFactory<DiamondParams> {
  public id: MaterialId = 'diamond.refraction.v1';
  public family: 'gemstone' = 'gemstone';

  public create(params: DiamondParams): MeshPhysicalMaterial {
    const colorObj = new Color(params.color);
    const mat = new MeshPhysicalMaterial({
      color: colorObj,
      transmission: 1.0,
      opacity: 1.0,
      transparent: true,
      roughness: 0.0,
      ior: params.ior ?? 2.42,
      thickness: 2.5,
      specularIntensity: 1.0,
      specularColor: new Color(0xffffff),
      envMapIntensity: params.envMapIntensity ?? 1.5,
      attenuationColor: colorObj,
      attenuationDistance: 1.2
    });
    mat.name = 'RefractionDiamondMaterial';
    return mat;
  }

  public update(material: MeshPhysicalMaterial, params: Partial<DiamondParams>): void {
    if (params.color !== undefined) {
      const c = new Color(params.color);
      material.color.copy(c);
      material.attenuationColor.copy(c);
    }
    if (params.ior !== undefined) {
      material.ior = params.ior;
    }
    if (params.envMapIntensity !== undefined) {
      material.envMapIntensity = params.envMapIntensity;
    }
    material.needsUpdate = true;
  }

  public dispose(material: MeshPhysicalMaterial): void {
    material.dispose();
  }
}
