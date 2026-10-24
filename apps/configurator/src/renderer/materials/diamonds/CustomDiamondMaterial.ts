import { ShaderMaterial, Color, Vector3 } from 'three';
import { MaterialFactory, MaterialId, DiamondParams } from '../types.js';
import refractionVert from '../../shaders/diamond/refraction.vert.glsl?raw';
import refractionFrag from '../../shaders/diamond/refraction.frag.glsl?raw';

export class CustomDiamondMaterialFactory implements MaterialFactory<DiamondParams> {
  public id: MaterialId = 'diamond.custom.v1';
  public family: 'gemstone' = 'gemstone';

  public create(params: DiamondParams): ShaderMaterial {
    const colorObj = new Color(params.color);
    const mat = new ShaderMaterial({
      vertexShader: refractionVert,
      fragmentShader: refractionFrag,
      uniforms: {
        envMap: { value: null },
        envMapIntensity: { value: params.envMapIntensity ?? 1.5 },
        ior: { value: params.ior ?? 2.42 },
        dispersion: { value: params.dispersion ?? 0.015 },
        colorTint: { value: new Vector3(colorObj.r, colorObj.g, colorObj.b) },
        absorption: { value: params.absorption ?? 0.0 },
        bounces: { value: params.bounces ?? 5.0 }
      }
    });
    mat.name = 'CustomDiamondMaterial';
    return mat;
  }

  public update(material: ShaderMaterial, params: Partial<DiamondParams>): void {
    if (params.color !== undefined) {
      const c = new Color(params.color);
      material.uniforms.colorTint.value.set(c.r, c.g, c.b);
    }
    if (params.ior !== undefined) {
      material.uniforms.ior.value = params.ior;
    }
    if (params.dispersion !== undefined) {
      material.uniforms.dispersion.value = params.dispersion;
    }
    if (params.envMapIntensity !== undefined) {
      material.uniforms.envMapIntensity.value = params.envMapIntensity;
    }
    material.needsUpdate = true;
  }

  public dispose(material: ShaderMaterial): void {
    material.dispose();
  }
}
