import { useState, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { autoFrameModel } from '@/features/shared-viewer/lib/CameraAutoFitter';
import { createMetalMaterial } from '@/features/ring-viewer/lib/ring-materials';
import { createGemstoneMaterial } from '@/features/ring-viewer/lib/gemstone-materials';
import {
  MeshNodeInfo,
  SemanticMeshRole,
  ProductCategory,
  PublishedProductManifest,
} from '../types/inspector.types';

export function useModelInspector() {
  const [isLoading, setIsLoading] = useState(false);
  const [activeFileName, setActiveFileName] = useState<string>('');
  const [meshNodes, setMeshNodes] = useState<MeshNodeInfo[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | undefined>();
  const [category, setCategory] = useState<ProductCategory>('ring');
  const [productTitle, setProductTitle] = useState<string>('Custom Jewellery Piece');

  // Preview metal swatch for live inspection
  const [previewMetalId, setPreviewMetalId] = useState<string>('white_gold');

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const modelRootRef = useRef<THREE.Group | null>(null);

  // Mesh reference map by ID
  const meshMap = useRef<Map<string, THREE.Mesh>>(new Map());

  // Setup Three.js scene for inspector preview
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xd4d4d4);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(15, width / height, 0.1, 100);
    camera.position.set(0, 5, 15);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    rendererRef.current = renderer;

    // OrbitControls
    const controls = new OrbitControls(camera, canvasRef.current);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 2.0);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 3.5);
    dirLight.position.set(0, 15, -8);
    scene.add(dirLight);

    const fillLight = new THREE.DirectionalLight(0xf0f5ff, 2.2);
    fillLight.position.set(8, 8, -4);
    scene.add(fillLight);

    // Studio PMREM
    const pmrem = new THREE.PMREMGenerator(renderer);
    pmrem.compileEquirectangularShader();
    const envScene = new THREE.Scene();
    envScene.background = new THREE.Color(0x9aa0a6);

    const addLightStrip = (w: number, h: number, pos: [number, number, number], rot?: [number, number, number]) => {
      const mesh = new THREE.Mesh(
        new THREE.PlaneGeometry(w, h),
        new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide })
      );
      mesh.position.set(...pos);
      if (rot) mesh.rotation.set(...rot);
      else mesh.lookAt(0, 0, 0);
      envScene.add(mesh);
    };

    addLightStrip(40, 40, [0, 25, 0], [Math.PI / 2, 0, 0]);
    addLightStrip(25, 25, [-15, 12, -15]);
    addLightStrip(25, 25, [15, 12, -15]);

    scene.environment = pmrem.fromScene(envScene).texture;

    // Contact shadow
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
    const shadowTex = new THREE.CanvasTexture(shadowCanvas);
    const shadowMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(3.0, 3.0),
      new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, opacity: 0.8, depthWrite: false })
    );
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.set(0, -0.6, 0);
    scene.add(shadowMesh);

    // Render loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      if (controls) controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
      pmrem.dispose();
      renderer.dispose();
    };
  }, []);

  // Load user uploaded file into 3D viewer
  const loadUploadedGLB = async (file: File) => {
    if (!sceneRef.current || !cameraRef.current) return;
    setIsLoading(true);
    setActiveFileName(file.name);

    try {
      const arrayBuffer = await file.arrayBuffer();

      const loader = new GLTFLoader();
      const draco = new DRACOLoader();
      draco.setDecoderPath('/draco/gltf/');
      loader.setDRACOLoader(draco);

      loader.parse(
        arrayBuffer,
        '',
        (gltf) => {
          if (!sceneRef.current || !cameraRef.current) return;

          // Remove previous model
          if (modelRootRef.current) {
            sceneRef.current.remove(modelRootRef.current);
          }

          const model = gltf.scene;
          modelRootRef.current = model;
          sceneRef.current.add(model);

          // Auto-frame camera to fit arbitrary uploaded model
          autoFrameModel(model, cameraRef.current);

          // Extract scene mesh nodes
          const detectedNodes: MeshNodeInfo[] = [];
          meshMap.current.clear();
          let meshCounter = 0;

          model.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
              const mesh = child as THREE.Mesh;
              meshCounter++;
              const id = `node_${meshCounter}`;
              meshMap.current.set(id, mesh);

              const geo = mesh.geometry;
              const triangleCount = geo.index
                ? geo.index.count / 3
                : geo.attributes.position
                ? geo.attributes.position.count / 3
                : 0;

              // Automatic initial heuristic role classification
              const mat = mesh.material as THREE.Material;
              const matName = mat?.name?.toLowerCase() || '';
              const nodeName = mesh.name?.toLowerCase() || '';

              let role: SemanticMeshRole = 'unassigned';
              if (matName.includes('gem') || matName.includes('diam') || nodeName.includes('gem') || nodeName.includes('diam')) {
                role = meshCounter === 1 || triangleCount > 2000 ? 'centerGem' : 'sideGem';
              } else if (matName.includes('metal') || matName.includes('gold') || nodeName.includes('shank') || nodeName.includes('band')) {
                role = 'metal';
              }

              mesh.userData.role = role;
              mesh.userData.originalMaterial = mesh.material;

              detectedNodes.push({
                id,
                name: mesh.name || `Part_${meshCounter}`,
                uuid: mesh.uuid,
                vertexCount: geo.attributes.position ? geo.attributes.position.count : 0,
                triangleCount: Math.round(triangleCount),
                materialName: mat?.name || 'Embedded glTF Material',
                assignedRole: role,
              });
            }
          });

          setMeshNodes(detectedNodes);
          setIsLoading(false);
        },
        (error) => {
          console.error('Error parsing GLTF:', error);
          setIsLoading(false);
        }
      );
    } catch (err) {
      console.error('Failed to load file:', err);
      setIsLoading(false);
    }
  };

  // Assign semantic role to a mesh and apply live preview PBR material
  const assignRole = (nodeId: string, role: SemanticMeshRole) => {
    const mesh = meshMap.current.get(nodeId);
    if (mesh) {
      mesh.userData.role = role;

      if (role === 'metal' || role === 'band' || role === 'prongs') {
        mesh.material = createMetalMaterial({
          id: previewMetalId,
          name: previewMetalId,
          icon: '',
          colorHex: previewMetalId === 'yellow_gold' ? '#f4ce6a' : previewMetalId === 'rose_gold' ? '#e89a82' : '#e5e7ea',
          metalness: 1.0,
          roughness: 0.07,
          priceDelta: 0,
        });
      } else if (role === 'centerGem') {
        mesh.material = createGemstoneMaterial(
          { id: 'diamond', name: 'Diamond', icon: '', color: '#ffffff', transmissionColor: '#ffffff', ior: 2.42 },
          true,
          sceneRef.current?.environment
        );
      } else if (role === 'sideGem') {
        mesh.material = createGemstoneMaterial(
          { id: 'diamond', name: 'Diamond', icon: '', color: '#ffffff', transmissionColor: '#ffffff', ior: 2.42 },
          false,
          sceneRef.current?.environment
        );
      } else if (role === 'unassigned') {
        mesh.material = mesh.userData.originalMaterial || mesh.material;
      }
    }

    setMeshNodes((prev) =>
      prev.map((node) => (node.id === nodeId ? { ...node, assignedRole: role } : node))
    );
  };

  // Select node and visually highlight in 3D
  const selectNode = (node: MeshNodeInfo) => {
    setSelectedNodeId(node.id);

    // Reset previous highlights
    meshMap.current.forEach((m) => {
      if (m.userData.isHighlighted) {
        m.userData.isHighlighted = false;
        // restore material
      }
    });

    const targetMesh = meshMap.current.get(node.id);
    if (targetMesh) {
      targetMesh.userData.isHighlighted = true;
    }
  };

  // Export product configuration manifest as JSON
  const exportProductManifest = () => {
    const roles: Record<string, SemanticMeshRole> = {};
    meshNodes.forEach((node) => {
      roles[node.name || node.id] = node.assignedRole;
    });

    const manifest: PublishedProductManifest = {
      id: `prod_${Date.now()}`,
      title: productTitle,
      category,
      modelFileName: activeFileName,
      fileSizeMB: 0,
      meshCount: meshNodes.length,
      totalTriangles: meshNodes.reduce((acc, n) => acc + n.triangleCount, 0),
      roles,
      capabilities: {
        supportedMetals: ['white_gold', 'yellow_gold', 'rose_gold', 'platinum'],
        supportedGemstones: ['diamond', 'blue_sapphire', 'ruby', 'emerald'],
        supportedCarats: [0.5, 1.0, 1.5, 2.0],
        allowEternityStack: category === 'ring',
      },
      createdAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(manifest, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeFileName.replace('.glb', '')}-manifest.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return {
    canvasRef,
    containerRef,
    isLoading,
    activeFileName,
    meshNodes,
    selectedNodeId,
    category,
    setCategory,
    productTitle,
    setProductTitle,
    previewMetalId,
    setPreviewMetalId,
    loadUploadedGLB,
    assignRole,
    selectNode,
    exportProductManifest,
  };
}
