import { Material } from 'three';
import { MaterialFactory, MaterialId } from './types.js';
import { PbrMetalMaterialFactory } from './metals/PbrMetalMaterial.js';
import { RefractionDiamondMaterialFactory } from './diamonds/RefractionDiamondMaterial.js';
import { CustomDiamondMaterialFactory } from './diamonds/CustomDiamondMaterial.js';

export class MaterialRegistry {
  private static factories: Map<MaterialId, MaterialFactory<any>> = new Map();
  private static cache: Map<string, Material> = new Map();

  static {
    this.register(new PbrMetalMaterialFactory());
    this.register(new RefractionDiamondMaterialFactory());
    this.register(new CustomDiamondMaterialFactory());
  }

  public static register<T>(factory: MaterialFactory<T>): void {
    this.factories.set(factory.id, factory);
  }

  public static getMaterial<T>(id: MaterialId, params: T, cacheKey?: string): Material {
    if (cacheKey && this.cache.has(cacheKey)) {
      const existing = this.cache.get(cacheKey)!;
      const factory = this.factories.get(id);
      if (factory) {
        factory.update(existing, params as any);
      }
      return existing;
    }

    const factory = this.factories.get(id);
    if (!factory) {
      throw new Error(`[MaterialRegistry] Material factory '${id}' is not registered.`);
    }

    const mat = factory.create(params);
    if (cacheKey) {
      this.cache.set(cacheKey, mat);
    }
    return mat;
  }

  public static clearCache(): void {
    this.cache.forEach(mat => mat.dispose());
    this.cache.clear();
  }
}
