import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { SharedSceneContext, SharedSceneLights } from '../types/jewelleryViewer.types';

export interface CreateJewellerySceneOptions {
  canvas: HTMLCanvasElement;
  width: number;
  height: number;
  cameraFov?: number;
  cameraPosition?: THREE.Vector3;
  controlsTarget?: THREE.Vector3;
  shadowY?: number;
}

/**
 * Creates the unified Three.js scene, camera, renderer, studio lighting rig,
 * and contact shadow used by both the customer configurator and model inspector.
 */
export function createJewelleryScene(
  options: CreateJewellerySceneOptions
): SharedSceneContext {
  const {
    canvas,
    width,
    height,
    cameraFov = 15,
    cameraPosition,
    controlsTarget = new THREE.Vector3(0, -0.12, 0),
    shadowY = -0.6,
  } = options;

  // 1. Scene with standard jewelry neutral gray background
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xd4d4d4);

  // 2. Camera: 15° telephoto perspective to minimize perspective distortion
  const aspect = width / height;
  const camera = new THREE.PerspectiveCamera(cameraFov, aspect, 0.1, 100);
  const mobileFactor = width < 768 ? Math.max(1.0, (768 / width) * 0.88) : 1.0;

  if (cameraPosition) {
    camera.position.copy(cameraPosition);
  } else {
    camera.position.set(-0.024 * mobileFactor, 10.5 * mobileFactor, -4.85 * mobileFactor);
  }

  // 3. Renderer with ACESFilmic Tone Mapping and sRGB output
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance',
  });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.25;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  // 4. OrbitControls
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.target.copy(controlsTarget);
  controls.minDistance = 1.3;
  controls.maxDistance = 25.0;
  controls.maxPolarAngle = Math.PI / 2; // Prevent camera from going beneath ground plane

  // 5. Studio Lighting Rig: balanced fill preserving precious metal specular highlights
  const ambient = new THREE.AmbientLight(0xffffff, 0.45);
  scene.add(ambient);

  const key = new THREE.DirectionalLight(0xffffff, 2.8);
  key.position.set(0, 10, -5);
  scene.add(key);

  const fill = new THREE.DirectionalLight(0xf0f5ff, 1.5);
  fill.position.set(6, 6, -3);
  scene.add(fill);

  const rim = new THREE.DirectionalLight(0xffffff, 1.8);
  rim.position.set(-6, 6, -3);
  scene.add(rim);

  const backRim = new THREE.DirectionalLight(0xfff6ea, 1.2);
  backRim.position.set(0, 8, 6);
  scene.add(backRim);

  const lights: SharedSceneLights = { ambient, key, fill, rim, backRim };

  // 6. PMREM Generator and baseline studio environment
  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  pmremGenerator.compileEquirectangularShader();

  const envScene = new THREE.Scene();
  envScene.background = new THREE.Color(0x9aa0a6);

  const addLightPanel = (
    w: number,
    h: number,
    pos: [number, number, number],
    intensity: number = 1.0,
    rot?: [number, number, number]
  ) => {
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(w, h),
      new THREE.MeshBasicMaterial({
        color: new THREE.Color(intensity, intensity, intensity),
        side: THREE.DoubleSide,
      })
    );
    mesh.position.set(...pos);
    if (rot) mesh.rotation.set(...rot);
    else mesh.lookAt(0, 0, 0);
    envScene.add(mesh);
  };

  // Overhead softbox array
  addLightPanel(40, 40, [0, 25, 0], 2.0, [Math.PI / 2, 0, 0]);
  addLightPanel(30, 30, [-15, 15, -15], 1.8);
  addLightPanel(30, 30, [15, 15, -15], 1.8);
  addLightPanel(30, 25, [0, 18, 18], 1.5);
  addLightPanel(20, 20, [0, -8, -8], 0.8);

  // Pin-point sparkle spots for gemstone scintillation
  addLightPanel(5, 5, [-8, 20, -6], 4.5);
  addLightPanel(5, 5, [8, 20, -6], 4.5);
  addLightPanel(4, 10, [0, 24, -10], 4.0);
  addLightPanel(6, 6, [12, 12, 8], 3.8);

  const fallbackEnvMap = pmremGenerator.fromScene(envScene).texture;
  scene.environment = fallbackEnvMap;

  // 7. Calibrated Ground Contact Shadow Plane
  const shadowCanvas = document.createElement('canvas');
  shadowCanvas.width = 512;
  shadowCanvas.height = 512;
  const ctx = shadowCanvas.getContext('2d');
  if (ctx) {
    const grad = ctx.createRadialGradient(256, 256, 10, 256, 256, 175);
    grad.addColorStop(0, 'rgba(25, 25, 25, 0.7)');
    grad.addColorStop(0.35, 'rgba(40, 40, 40, 0.5)');
    grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(256, 256, 190, 110, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  const shadowTexture = new THREE.CanvasTexture(shadowCanvas);
  const shadowGeo = new THREE.PlaneGeometry(3.0, 3.0);
  const shadowMat = new THREE.MeshBasicMaterial({
    map: shadowTexture,
    transparent: true,
    opacity: 0.8,
    depthWrite: false,
  });

  const contactShadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
  contactShadowMesh.rotation.x = -Math.PI / 2;
  contactShadowMesh.position.set(0, shadowY, 0);
  contactShadowMesh.renderOrder = 0;
  scene.add(contactShadowMesh);

  // Clean disposal helper
  const dispose = () => {
    controls.dispose();
    fallbackEnvMap.dispose();
    shadowTexture.dispose();
    shadowGeo.dispose();
    shadowMat.dispose();
    pmremGenerator.dispose();
    renderer.dispose();
  };

  return {
    scene,
    camera,
    renderer,
    controls,
    pmremGenerator,
    contactShadowMesh,
    lights,
    dispose,
  };
}
