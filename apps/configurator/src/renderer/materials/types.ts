import { Material, Color } from 'three';

export type MaterialId = 'metal.pbr.v1' | 'diamond.refraction.v1' | 'diamond.custom.v1';

export interface PbrMetalParams {
  color: string | Color;
  metalness: number;
  roughness: number;
  envMapIntensity?: number;
}

export interface DiamondParams {
  color: string | Color;
  ior?: number;
  dispersion?: number;
  bounces?: number;
  absorption?: number;
  envMapIntensity?: number;
}

export interface MaterialFactory<TParams> {
  id: MaterialId;
  family: 'metal' | 'gemstone';
  create(params: TParams): Material;
  update(material: Material, params: Partial<TParams>): void;
  dispose(material: Material): void;
}
