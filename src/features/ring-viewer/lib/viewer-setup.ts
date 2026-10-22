import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export interface SetupViewerResult {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  controls: OrbitControls;
  ringGroup: THREE.Group;
  pmremGenerator: THREE.PMREMGenerator;
}

/**
 * Initializes the Three.js 3D viewport, camera, renderer, controls, studio environment,
 * lights, and contact shadow plane according to measured reference benchmarks.
 */
export function setupViewer(
  canvas: HTMLCanvasElement,
  width: number,
  height: number
): SetupViewerResult {
  // 1. Scene with benchmark background tone (#d4d4d4 / #ececec container)
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xd4d4d4);

  // 2. Camera: telephoto perspective matching reference (15 deg FOV)
  const aspect = width / height;
  const camera = new THREE.PerspectiveCamera(15, aspect, 0.1, 100);
  const mobileFactor = width < 768 ? Math.max(1.0, (768 / width) * 0.88) : 1.0;
  camera.position.set(-0.024 * mobileFactor, 11.51 * mobileFactor, -4.22 * mobileFactor);

  // 3. Renderer with ACESFilmic Tone Mapping for jewelry dynamic range
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance',
  });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.35;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  // 4. OrbitControls with smooth damping and pitch bounds
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.target.set(0, -0.15, 0);
  controls.minDistance = 1.3;
  controls.maxDistance = 25.0;
  controls.maxPolarAngle = Math.PI / 2; // Prevent flipping beneath the table

  // 5. Studio Directional & Ambient Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 1.8);
  scene.add(ambientLight);

  const keyLight = new THREE.DirectionalLight(0xffffff, 3.5);
  keyLight.position.set(0, 10, -5);
  scene.add(keyLight);

  const fillLight = new THREE.DirectionalLight(0xf0f5ff, 2.0);
  fillLight.position.set(6, 6, -3);
  scene.add(fillLight);

  const rimLight = new THREE.DirectionalLight(0xffffff, 2.5);
  rimLight.position.set(-6, 6, -3);
  scene.add(rimLight);

  const backRim = new THREE.DirectionalLight(0xfff6ea, 1.5);
  backRim.position.set(0, 8, 6);
  scene.add(backRim);

  // 6. Studio PMREM Environment with balanced ambient luminance and high-contrast sparkle strips
  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  pmremGenerator.compileEquirectangularShader();

  const envScene = new THREE.Scene();
  envScene.background = new THREE.Color(0x9aa0a6); // Luminous studio ambient gray (prevents black facet extinction)

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

  // Overhead softbox array for continuous metal highlights
  addLightPanel(40, 40, [0, 25, 0], 2.0, [Math.PI / 2, 0, 0]); // Primary top
  addLightPanel(30, 30, [-15, 15, -15], 1.8);                  // Front-left
  addLightPanel(30, 30, [15, 15, -15], 1.8);                   // Front-right
  addLightPanel(30, 25, [0, 18, 18], 1.5);                     // Back-top
  addLightPanel(20, 20, [0, -8, -8], 0.8);                     // Ground fill

  // High-intensity pin-point accent spots for diamond fire and scintillation
  addLightPanel(5, 5, [-8, 20, -6], 4.5);
  addLightPanel(5, 5, [8, 20, -6], 4.5);
  addLightPanel(4, 10, [0, 24, -10], 4.0);
  addLightPanel(6, 6, [12, 12, 8], 3.8);

  const envMap = pmremGenerator.fromScene(envScene).texture;
  scene.environment = envMap;

  // 7. Ground Contact Shadow plane (measured radial blur ellipse)
  const shadowCanvas = document.createElement('canvas');
  shadowCanvas.width = 512;
  shadowCanvas.height = 512;
  const ctx = shadowCanvas.getContext('2d');
  if (ctx) {
    const grad = ctx.createRadialGradient(256, 256, 10, 256, 256, 175);
    grad.addColorStop(0, 'rgba(25, 25, 25, 0.75)');
    grad.addColorStop(0.35, 'rgba(40, 40, 40, 0.55)');
    grad.addColorStop(0.65, 'rgba(70, 70, 70, 0.18)');
    grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(256, 256, 190, 110, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  const shadowTex = new THREE.CanvasTexture(shadowCanvas);
  const shadowGeo = new THREE.PlaneGeometry(2.2, 2.2);
  const shadowMat = new THREE.MeshBasicMaterial({
    map: shadowTex,
    transparent: true,
    depthWrite: false,
    opacity: 0.82,
  });
  const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
  shadowMesh.rotation.x = -Math.PI / 2;
  shadowMesh.position.set(0, -0.52, 0);
  scene.add(shadowMesh);

  // 8. Ring Group anchor with calibrated scale and orientation
  const ringGroup = new THREE.Group();
  ringGroup.rotation.y = Math.PI; // Prongs face forward toward camera
  ringGroup.scale.set(0.55, 0.55, 0.55);
  scene.add(ringGroup);

  return {
    scene,
    camera,
    renderer,
    controls,
    ringGroup,
    pmremGenerator,
  };
}
