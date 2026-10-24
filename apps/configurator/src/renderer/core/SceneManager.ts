import { Vector3 } from 'three';

export interface CameraPreset {
  position: Vector3;
  target: Vector3;
  fov: number;
}

export class SceneManager {
  public static getPerspectivePreset(isMobile: boolean): CameraPreset {
    if (isMobile) {
      return {
        position: new Vector3(0, 1.2, 7.5),
        target: new Vector3(0, 0, 0),
        fov: 55
      };
    }
    return {
      position: new Vector3(0, 1.0, 5.5),
      target: new Vector3(0, 0, 0),
      fov: 35
    };
  }
}
