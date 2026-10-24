import { useGLTF } from '@react-three/drei';

export class AssetLoader {
  private static loadedCache: Set<string> = new Set();

  public static preloadModel(url: string): void {
    if (!this.loadedCache.has(url)) {
      useGLTF.preload(url);
      this.loadedCache.add(url);
    }
  }

  public static clearCache(): void {
    if (this.loadedCache.size > 0) {
      useGLTF.clear(Array.from(this.loadedCache));
    }
    this.loadedCache.clear();
  }
}
