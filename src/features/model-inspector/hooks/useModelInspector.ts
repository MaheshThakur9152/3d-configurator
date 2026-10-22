import { useState, useRef, useEffect, useCallback } from 'react';
import * as THREE from 'three';
import {
  createJewelleryScene,
  loadJewelleryEnvironments,
  JewelleryEnvironmentResources,
  autoFrameModel,
  identifyMeshRole,
  applyMaterialProfileToMesh,
  loadGlbModel,
  createRenderScheduler,
  RenderScheduler,
  SemanticMeshRole,
  ProductCategory,
  PublishedProductManifest,
  MeshNodeInfo,
} from '@/features/shared-viewer';

export function useModelInspector() {
  const [isLoading, setIsLoading] = useState(false);
  const [activeFileName, setActiveFileName] = useState<string>('');
  const [meshNodes, setMeshNodes] = useState<MeshNodeInfo[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | undefined>();
  const [category, setCategory] = useState<ProductCategory>('ring');
  const [productTitle, setProductTitle] = useState<string>('Custom Jewellery Piece');
  const [previewMetalId, setPreviewMetalId] = useState<string>('white_gold');

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<any>(null);
  const modelRootRef = useRef<THREE.Group | null>(null);
  const schedulerRef = useRef<RenderScheduler | null>(null);
  const highlightHelperRef = useRef<THREE.BoxHelper | null>(null);

  // Mesh reference map by ID
  const meshMap = useRef<Map<string, THREE.Mesh>>(new Map());
  const environmentsRef = useRef<JewelleryEnvironmentResources | null>(null);

  const requestRender = useCallback(() => {
    schedulerRef.current?.requestRender();
  }, []);

  // Setup unified Three.js scene for inspector preview
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const {
      scene,
      camera,
      renderer,
      controls,
      pmremGenerator,
      dispose: disposeScene,
    } = createJewelleryScene({
      canvas: canvasRef.current,
      width,
      height,
    });

    sceneRef.current = scene;
    cameraRef.current = camera;
    rendererRef.current = renderer;
    controlsRef.current = controls;

    // Attach shared on-demand render scheduler
    const scheduler = createRenderScheduler({
      renderer,
      scene,
      camera,
      controls,
    });
    schedulerRef.current = scheduler;
    scheduler.start();

    // Load authentic studio environments asynchronously
    loadJewelleryEnvironments(pmremGenerator)
      .then((envs) => {
        environmentsRef.current = envs;
        scene.environment = envs.metalPmrem;

        // Reapply materials to any currently loaded model meshes
        meshMap.current.forEach((mesh) => {
          const role = (mesh.userData.assignedRole || mesh.userData.role || 'unassigned') as SemanticMeshRole;
          if (role !== 'unassigned') {
            applyMaterialProfileToMesh(mesh, role, {
              metal: previewMetalId,
              centerGem: 'diamond',
              sideGem: 'diamond',
              environments: envs,
            });
          }
        });
        scheduler.requestRender();
      })
      .catch((err) => {
        console.warn('[ModelInspector] Failed to load studio environments:', err);
      });

    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
      scheduler.requestRender();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      scheduler.stop();
      if (highlightHelperRef.current) {
        highlightHelperRef.current.geometry.dispose();
        (highlightHelperRef.current.material as THREE.Material).dispose();
      }
      disposeScene();
    };
  }, []);

  // Load user uploaded file into 3D viewer
  const loadUploadedGLB = async (file: File) => {
    if (!sceneRef.current || !cameraRef.current) return;
    setIsLoading(true);
    setActiveFileName(file.name);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const model = await loadGlbModel(arrayBuffer);

      if (!sceneRef.current || !cameraRef.current) return;

      // Remove previous model & highlight
      if (modelRootRef.current) {
        sceneRef.current.remove(modelRootRef.current);
      }
      if (highlightHelperRef.current) {
        sceneRef.current.remove(highlightHelperRef.current);
        highlightHelperRef.current = null;
      }

      modelRootRef.current = model;
      sceneRef.current.add(model);

      // Auto-frame camera to fit uploaded model
      autoFrameModel(model, cameraRef.current, controlsRef.current);

      // Extract scene mesh nodes preserving individual non-destructive meshes
      const detectedNodes: MeshNodeInfo[] = [];
      meshMap.current.clear();
      let meshCounter = 0;

      model.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          meshCounter++;
          const id = `node_${meshCounter}`;
          mesh.userData.id = id;
          meshMap.current.set(id, mesh);

          const geo = mesh.geometry;
          const triangleCount = geo.index
            ? geo.index.count / 3
            : geo.attributes.position
            ? geo.attributes.position.count / 3
            : 0;

          // Preserve original material
          if (!mesh.userData.originalMaterial) {
            mesh.userData.originalMaterial = mesh.material;
          }

          // Initial classification using unified conservative rules
          const mat = mesh.material as THREE.Material;
          const initialRole = identifyMeshRole(mesh, 'unassigned');
          mesh.userData.role = initialRole;

          detectedNodes.push({
            id,
            name: mesh.name || `Part_${meshCounter}`,
            uuid: mesh.uuid,
            vertexCount: geo.attributes.position ? geo.attributes.position.count : 0,
            triangleCount: Math.round(triangleCount),
            materialName: mat?.name || 'Embedded glTF Material',
            assignedRole: initialRole,
            isDesignerAssigned: false,
          });
        }
      });

      setMeshNodes(detectedNodes);
      setSelectedNodeId(undefined);
      setIsLoading(false);
      requestRender();
    } catch (err) {
      console.error('Failed to load file:', err);
      setIsLoading(false);
    }
  };

  // Assign semantic role to a mesh and apply live preview PBR material immediately
  const assignRole = (nodeId: string, role: SemanticMeshRole) => {
    const mesh = meshMap.current.get(nodeId);
    if (mesh) {
      mesh.userData.isDesignerAssigned = true;
      mesh.userData.assignedRole = role;

      applyMaterialProfileToMesh(mesh, role, {
        metal: previewMetalId,
        centerGem: 'diamond',
        sideGem: 'diamond',
        environments: environmentsRef.current,
      });

      requestRender();
    }

    setMeshNodes((prev) =>
      prev.map((node) =>
        node.id === nodeId ? { ...node, assignedRole: role, isDesignerAssigned: true } : node
      )
    );
  };

  // Change preview metal and immediately update all metal meshes in real time
  const handleSetPreviewMetalId = (metalId: string) => {
    setPreviewMetalId(metalId);

    meshMap.current.forEach((mesh) => {
      const role = (mesh.userData.assignedRole || mesh.userData.role) as SemanticMeshRole;
      if (role === 'metal' || role === 'band' || role === 'prongs') {
        applyMaterialProfileToMesh(mesh, role, {
          metal: metalId,
          centerGem: 'diamond',
          sideGem: 'diamond',
          environments: environmentsRef.current,
        });
      }
    });

    requestRender();
  };

  // Select node and visually highlight in 3D non-destructively
  const selectNode = (node: MeshNodeInfo) => {
    setSelectedNodeId(node.id);

    const targetMesh = meshMap.current.get(node.id);
    if (targetMesh && sceneRef.current) {
      if (!highlightHelperRef.current) {
        highlightHelperRef.current = new THREE.BoxHelper(targetMesh, 0x111827);
        highlightHelperRef.current.renderOrder = 999;
        (highlightHelperRef.current.material as THREE.LineBasicMaterial).depthTest = false;
        sceneRef.current.add(highlightHelperRef.current);
      } else {
        highlightHelperRef.current.setFromObject(targetMesh);
        highlightHelperRef.current.visible = true;
      }
      requestRender();
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

  // Import product manifest JSON and restore role mappings & materials
  const importProductManifest = async (file: File) => {
    try {
      const text = await file.text();
      const manifest: PublishedProductManifest = JSON.parse(text);

      if (manifest.title) setProductTitle(manifest.title);
      if (manifest.category) setCategory(manifest.category);

      const roles = manifest.roles || {};

      setMeshNodes((prev) =>
        prev.map((node) => {
          const mappedRole = roles[node.name] || roles[node.id];
          if (mappedRole) {
            const mesh = meshMap.current.get(node.id);
            if (mesh) {
              mesh.userData.isDesignerAssigned = true;
              mesh.userData.assignedRole = mappedRole;
              applyMaterialProfileToMesh(mesh, mappedRole, {
                metal: previewMetalId,
                centerGem: 'diamond',
                sideGem: 'diamond',
                environments: environmentsRef.current,
              });
            }
            return { ...node, assignedRole: mappedRole, isDesignerAssigned: true };
          }
          return node;
        })
      );

      requestRender();
    } catch (err) {
      console.error('Failed to import product manifest:', err);
    }
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
    setPreviewMetalId: handleSetPreviewMetalId,
    loadUploadedGLB,
    assignRole,
    selectNode,
    exportProductManifest,
    importProductManifest,
  };
}
