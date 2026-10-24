# 04 - 3D Ring Models and Asset Pipeline Investigation

## 1. Asset Inventory & Overview

The repository contains three binary glTF (`.glb`) assets located in `Crystal-Jewels/assets/`:
1. `ring_webgi.glb` (972,836 bytes / ~950 KB): The primary Solitaire diamond ring.
2. `ring2_webgi.glb` (1,124,708 bytes / ~1.10 MB): The alternate Halo / Pavé diamond ring.
3. `ring2_webgi3.glb` (1,123,816 bytes / ~1.10 MB): An orphaned development artifact.

Both active models utilize **glTF 2.0** with Draco geometry compression (`KHR_draco_mesh_compression`) and proprietary WebGI metadata extensions.

---

## 2. Master Asset Inventory Table

| Asset Filename | File Size | Nodes | Meshes | Total Vertices | Total Triangles | Materials | Embedded Images | Load Status in App | Purpose in Configurator |
|---|---|---|---|---|---|---|---|---|---|
| **`ring_webgi.glb`** | 972,836 B | 10 | 8 | 4,484 | 3,368 | 9 | 1 (1024x512 PNG, 679 KB) | **Active** (`index.ts:141, 664`) | Ring Model 1 (Solitaire ring with 6 diamond components, gold shank, silver prongs) |
| **`ring2_webgi.glb`** | 1,124,708 B | 66 | 5 | 8,924 | 14,848 | 5 | 1 (1024x512 PNG, 679 KB) | **Active** (`index.ts:635`) | Ring Model 2 (Halo ring with center stone, 16 cushion side stones, 44 pavé stones, alliance, entourage) |
| **`ring2_webgi3.glb`** | 1,123,816 B | 66 | 5 | 8,924 | 14,848 | 5 | 1 (1024x512 PNG, 679 KB) | **Unused** (0 references) | Duplicate/experimental test iteration with alternate node transforms |

---

## 3. Detailed Model Disassembly

### Model 1: `ring_webgi.glb` (The Solitaire Ring)

#### Scene Graph & Node Hierarchy:
```
[Scene-centered] (Node 9) - tr: [-0.0003, -0.0429, -0.0926]
   └── [Scene_1] (Node 8) - rot: [0, 0, 0.435, 0.900], scale: [1.063, 1.063, 1.063]
         ├── [diamonds002] (Node 0) -> Mesh 0 (562 verts, 316 tris) -> Mat 1 (Diamond)
         ├── [diamonds001] (Node 1) -> Mesh 1 (562 verts, 316 tris) -> Mat 2 (Diamond)
         ├── [diamonds003] (Node 2) -> Mesh 2 (562 verts, 316 tris) -> Mat 3 (Diamond)
         ├── [diamonds005] (Node 3) -> Mesh 3 (564 verts, 318 tris) -> Mat 4 (Diamond)
         ├── [diamonds]    (Node 4) -> Mesh 4 (556 verts, 314 tris) -> Mat 5 (Diamond)
         ├── [diamonds004] (Node 5) -> Mesh 5 (562 verts, 316 tris) -> Mat 6 (Diamond)
         ├── [gold]        (Node 6) -> Mesh 6 (558 verts, 856 tris) -> Mat 7 (gold PBR)
         └── [silver]      (Node 7) -> Mesh 7 (558 verts, 892 tris) -> Mat 8 (silver PBR)
```

#### Observations on Model 1:
- **Diamonds are Real 3D CAD Geometry**: Each diamond mesh is an authentic 57-facet Round Brilliant cut with distinct table, crown, girdle, pavilion, and culet facets. They are not flat billboard planes or texture decals.
- **Why 6 Diamond Meshes?**: Rather than a single mesh, the diamond is segmented into 6 separate meshes (`diamonds`, `diamonds001` through `diamonds005`). This was done by the 3D artist in Blender to allow individual control over the table facet, crown facets, and pavilion facets, or to represent multiple smaller accent stones.
- **Mesh Optimization**: Draco compression compresses the 4,484 vertices down to just **293 KB of geometry buffers**, allowing fast loading.

---

### Model 2: `ring2_webgi.glb` (The Halo / Pavé Ring)

#### Scene Graph & Node Hierarchy:
```
[Scene] (Node 65)
   └── [Scene_1] (Node 64) - tr: [0, -0.018, -0.001], scale: [11.40, 11.40, 11.40]
         └── [ring-compare] (Node 63) - scale: [0.01, 0.01, 0.01]
               ├── [diamond_side_cuchion_001..016] (Nodes 0-15) -> Mesh 0 (Shared instance)
               ├── [dia001..044]                   (Nodes 16-59)-> Mesh 1 (Shared instance)
               ├── [Object]                        (Node 60)   -> Mesh 2 (Center Diamond)
               ├── [alliance]                      (Node 61)   -> Mesh 3 (Lower Band)
               └── [entourage]                     (Node 62)   -> Mesh 4 (Upper Halo Setting)
```

#### Observations on Model 2:
- **Geometry Instancing**: Unlike Ring 1, Ring 2 utilizes glTF node sharing:
  - **Mesh 0** (Cushion cut side diamond) is reused across **16 separate scene nodes** (`diamond_side_cuchion_001` to `016`), with individual transformation matrices (translation, rotation, scale) positioning each stone around the halo.
  - **Mesh 1** (Small round brilliant pavé diamond) is reused across **44 separate scene nodes** (`dia001` to `dia044`), lining the shank band.
  - **Mesh 2** (`Object`): The primary center gemstone.
- **Customization Quirk**: In `Crystal-Jewels/src/index.ts` lines 159–162, when `ringModel == 2`, the code only adds `'Object'` to `diamondObjects`. As a result, when changing gemstone colors on Ring 2, **only the center stone changes color**; the 60 halo and pavé stones remain white diamond!

---

### Model 3: `ring2_webgi3.glb` (Orphaned Test Artifact)

Comparative analysis of `ring2_webgi.glb` and `ring2_webgi3.glb` using our inspection script (`scratch/compare_ring2.py`) revealed:
1. Both files share identical vertex and triangle counts (8,924 verts, 14,848 tris) and identical material slots.
2. In `ring2_webgi3.glb`, Node 64 is named `'Scene'` instead of `'Scene_1'`.
3. Node indices for `alliance` and `entourage` are swapped (Nodes 61 and 62 inverted).
4. `Crystal-Jewels/src/index.ts` explicitly loads `./assets/ring2_webgi.glb` on line 635, and searches for `'Scene_1'` on line 640. If `ring2_webgi3.glb` were loaded, `viewer.scene.findObjectsByName('Scene_1')[0]` would return `undefined` and crash the application.
5. **Conclusion**: `ring2_webgi3.glb` is an unreferenced development test build and can be safely deleted to save 1.12 MB.

---

## 4. The Draco Mesh Compression Impact

All three GLB models specify Draco compression in their glTF headers:
```json
{
  "extensionsUsed": ["KHR_draco_mesh_compression"],
  "extensionsRequired": ["KHR_draco_mesh_compression"]
}
```

### Analysis of Draco Compression:
- **Payload Savings**: Draco reduces vertex position and normal precision using 14-bit integer quantization and edge-breaker entropy coding. For Ring 2, 14,848 triangles and 8,924 vertices are compressed into ~350 KB of binary payload.
- **Runtime Penalty**: On page load, the browser must fetch the WebAssembly Draco decoder (`draco_decoder.wasm`, ~150 KB) and decompress the buffers on the CPU before uploading to the GPU. This introduces a 100–300 ms thread blocking freeze on lower-end mobile devices during model swapping.
- **Alternative for Production**: Modern glTF optimization pipelines prefer **`EXT_meshopt_compression`** with quantized vertex attributes. Meshopt decompresses in pure WebAssembly at gigabytes-per-second speeds—up to 10x faster than Draco—eliminating the loading hitch.

---

## 5. Asset Optimization Opportunities

| Optimization Opportunity | Current State | Recommended Production State | Expected Benefit |
|---|---|---|---|
| **Externalize Environment HDRI** | 1024x512 PNG (679 KB) embedded inside **every** GLB file (1.36 MB total duplicate data) | Host a single pre-filtered `.hdr` or `.exr` file externally | Cuts GLB file size by **70%** (from ~1 MB down to ~290 KB per ring) |
| **Delete Orphaned Asset** | `ring2_webgi3.glb` (1.12 MB) committed to repo | Delete file from `assets/` | Reduces repository and deployment bundle size |
| **Hardware Instancing** | 44 pavé nodes represented as individual Three.js `Object3D` scene nodes | Single `InstancedMesh` with 44 transformation matrices | Reduces Three.js draw calls and CPU scene-graph traversal overhead |
| **Switch from Draco to Meshopt** | `KHR_draco_mesh_compression` | `EXT_meshopt_compression` | 10x faster decompression on mobile CPUs |
