# 00 - Executive Summary: Crystal Jewels 3D Diamond Ring Configurator

## Overview & Investigation Context

This report provides a comprehensive, code-backed technical investigation of the **Crystal Jewels** 3D Diamond Ring Configurator repository (`https://github.com/VikasRana10/3D-app`, application folder `Crystal-Jewels/`).

The application presents a luxury jewellery marketing landing page featuring an interactive 3D diamond ring that responds to scroll events and allows users to enter a "customizer" mode to tweak gemstone colors, metal finishes, and toggle between two complete ring models.

The primary objective of this investigation is to reverse-engineer:
1. The exact rendering engine and dependency chain.
2. The optical mechanism producing the photorealistic diamond appearance.
3. The construction of the 3D ring models and metallic materials.
4. The customization, state management, and e-commerce readiness of the application.
5. The architectural blueprint required to build a clean, in-house, production-grade equivalent using modern web standards (React Three Fiber, Drei, Three.js, and MedusaJS).

---

## High-Level Findings at a Glance

```
+--------------------------------------------------------------------------------------------------+
|                                    CRYSTAL JEWELS ARCHITECTURE                                   |
+--------------------------------------------------------------------------------------------------+
|                                                                                                  |
|  [ User Interface Layer ]                                                                        |
|  Vanilla HTML5 DOM + SCSS Styles + GSAP 3.10.4 ScrollTrigger                                     |
|  (Scroll-based camera choreography -> click to enter full-screen 3D configuration canvas)        |
|                                     |                                                            |
|                                     v                                                            |
|  [ Application Logic Layer ]                                                                     |
|  Crystal-Jewels/src/index.ts (721 lines of imperative procedural TypeScript)                     |
|  - In-place mutation of Three.js Mesh.material.color                                             |
|  - Binary model swapping via removeSceneModels() & manager.addFromPath()                         |
|  - Zero state management library, zero persistence, zero pricing engine                         |
|                                     |                                                            |
|                                     v                                                            |
|  [ 3D Rendering Framework ]                                                                      |
|  WebGI Runtime v0.4.6 (Pixotronics commercial WebGL2 wrapper over Three.js r139-r141)            |
|  - Render Pipeline: G-Buffer Depth -> SSAO -> SSR -> Diamond Pass -> Tonemap -> TAA -> Bloom   |
|                                     |                                                            |
|                                     v                                                            |
|  [ Gemstone Optical Engine ]                                                                     |
|  WebGI DiamondPlugin + DiamondMaterial (Custom ShaderMaterial subclass)                          |
|  - Automated CubeCamera Normal/Distance Pass renders internal facet cubemap (tCubeMapNormals)   |
|  - Fragment shader ray marches 5 internal ray bounces with Snell's law & Total Internal Refl.   |
|  - Chromatic dispersion via 3-wavelength RGB ray splitting (rIndexDelta = 0.012)                 |
|  - Beer-Lambert exponential absorption: exp(-r * (1.0 - color))                                 |
|                                     |                                                            |
|                                     v                                                            |
|  [ 3D Asset Pipeline ]                                                                           |
|  glTF 2.0 Binary (.glb) compressed with KHR_draco_mesh_compression                               |
|  - ring_webgi.glb (972 KB): Solitaire ring, 8 meshes, baked 1024x512 equirectangular HDR image  |
|  - ring2_webgi.glb (1.12 MB): Halo ring, 66 nodes, 60 pavé/side stones, 1 center cushion gem    |
|  - ring2_webgi3.glb (1.12 MB): Unused legacy/test iteration                                     |
+--------------------------------------------------------------------------------------------------+
```

---

## Key Executive Takeaways

### 1. Rendering Technology: WebGI, Not Raw Three.js
While the repository README claims the project is built purely with Three.js, static file inspection of `Crystal-Jewels/package.json` (lines 13, 18) and `Crystal-Jewels/package-lock.json` reveals the actual engine is **WebGI v0.4.6** (`https://storage.googleapis.com/dist.pixotronics.com/webgi/runtime/bundle-0.4.6.tgz`), developed by **Pixotronics** (headed by Palash Bansal). WebGI is a commercial-grade, proprietary rendering framework built on top of a customized fork of Three.js (r139/r141). The viewer requires WebGL 2.0 to support multiple render targets (MRT) and floating-point framebuffers for its deferred/post-processing pipeline.

### 2. The Diamond Realism Secret: Analytical Facet Raymarching
The diamond's visual brilliance is **not** achieved via standard Three.js materials (`MeshPhysicalMaterial`) or precomputed baked lighting textures. It is powered by WebGI's proprietary **`DiamondPlugin`** and **`DiamondMaterial`** (`ShaderMaterial`):
- **Object-Space Facet Capture**: When a diamond mesh is loaded, `DiamondPlugin` positions an offscreen `CubeCamera` inside the gemstone's centroid to capture a 6-face cubemap (`tCubeMapNormals`). The RGB channels encode facet plane normal vectors, and the Alpha channel encodes radial distance to the surface (`length(vecPosition) / radius`).
- **Internal Ray Bouncing**: The fragment shader (`Fo` in the runtime bundle) loops through **5 iterative ray bounces** (`RAY_BOUNCES = 5`). For each bounce, it reconstructs the nearest facet plane using `intersectSphere` and `linePlaneIntersect`.
- **Physical Optical Effects**:
  - **Total Internal Reflection (TIR)**: Handled when `dot(newDirection, newDirection) < epsilon`.
  - **Chromatic Dispersion**: Red, Green, and Blue rays are refracted at distinct angles by evaluating `refractiveIndex + rIndexDelta`, `refractiveIndex`, and `refractiveIndex - rIndexDelta` (where `rIndexDelta = 0.012`), and sampling the environment map independently for each color channel.
  - **Beer-Lambert Light Absorption**: Attenuates interior ray energy exponentially based on travelled distance: `attenuationFactor *= exp(-r * (1.0 - color))`.
  - **Fresnel Reflection**: Evaluated using Schlick's approximation with $F_0 = ((2.4 - 1.0) / (2.4 + 1.0))^2 \approx 0.17$.

### 3. Metallic Appearance: PBR + Baked Equirectangular HDRI
The ring shanks and prong settings are separated into distinct sub-meshes (`gold` and `silver` in ring 1; `alliance` and `entourage` in ring 2). They utilize WebGI's `MeshStandardMaterial2`, an extension of Three.js `MeshPhysicalMaterial`. The metals have `roughness: 0` and `metalness: ~0.91-1.0`. Visual inspection of `ring_webgi.glb` revealed that a 1024x512 equirectangular reflection map is **embedded directly inside the binary GLB** (`image 0`, taking up 679 KB of the 972 KB file) and registered into the viewer via the proprietary glTF extension `scenes[0].extensions['WEBGI_viewer']`.

### 4. Customization Architecture: Minimal In-Place Mutation
Customization is strictly visual and superficial:
- **Diamond Color**: Mutates `diamond.material.color` across an array of meshes via button click listeners (`Crystal-Jewels/src/index.ts` lines 532–537).
- **Metal Color**: Mutates `silver.material.color` and `gold.material.color` (`Crystal-Jewels/src/index.ts` lines 593–597).
- **Ring Switching**: Completely wipes the 3D scene (`viewer.scene.removeSceneModels()`) and fetches the alternate `.glb` over the network (`Crystal-Jewels/src/index.ts` lines 632–690).
- **No CAD Logic**: There is zero procedural geometry generation, parametric prong positioning, carat scaling, or ring size recalculation.

### 5. Production Gaps & Technical Debt
The codebase is an agency demonstration prototype (originally created by Brazilian digital studio **Neotix** for WebGI showcase, re-uploaded under the name Vikas Rana):
- **Zero E-Commerce Integration**: No cart, no checkout, no SKU mapping, no MedusaJS or backend endpoints.
- **Zero Pricing Engine**: No price calculations or price display elements exist anywhere in the code.
- **Zero State Persistence**: Refreshing the browser resets all user selections; state is held in loose procedural script variables.
- **Proprietary Vendor Lock-In**: WebGI runtime is loaded from an external Google Cloud Storage bucket (`storage.googleapis.com/dist.pixotronics.com`), posing severe licensing, stability, and vendor lock-in risks for an independent storefront.

---

## Comparison: Repository Findings vs. Production Requirements

| Feature / Requirement | Current Repository Status | Production E-Commerce Requirement |
|---|---|---|
| **Rendering Framework** | WebGI v0.4.6 (Proprietary closed-source SDK) | Three.js + React Three Fiber (R3F) + Drei (Open Source) |
| **Diamond Optics** | Internal CubeMap Raymarching (WebGI DiamondPlugin) | Custom GLSL Raymarching Shader or Drei `<MeshRefractionMaterial>` |
| **Metal Materials** | `MeshStandardMaterial2` with embedded 1024x512 HDRI | Three.js `MeshStandardMaterial` with Studio PMREM HDRI |
| **Geometry Swapping** | Hardcoded destruction and reloading of entire `.glb` files | Modular glTF components (shank, head, stone) composed dynamically |
| **Parametric Resizing** | None (Static geometry) | Procedural band scaling & prong adjustment via CAD morph targets |
| **Carat Weight Control** | None (Static mesh) | Scaled diamond geometry with proportional prong repositioning |
| **State Management** | Global mutable variables in `index.ts` | Reactive state store (Zustand / Redux) with URL parameter synchronization |
| **Pricing Engine** | Completely absent | Dynamic real-time formula ($MetalWeight \times MetalSpotPrice + DiamondPrice$) |
| **Commerce Backend** | Completely absent | Headless integration with MedusaJS (Cart Line Items & Custom Metadata) |
| **Mobile Optimization** | Basic checks disabling bloom and halving SSR steps | Tiered LOD models, simplified PBR fallbacks, WebGL context loss recovery |

---

## Deliverable Roadmap

The technical findings of this investigation are organized across 10 specialized architectural documents:

1. [**01-RENDERING-ENGINE-AND-ARCHITECTURE.md**](file:///D:/3D-app/docs/reverse-engineering/01-RENDERING-ENGINE-AND-ARCHITECTURE.md): Exact WebGI pipeline, plugin initialization, render loop, and Three.js relationship.
2. [**02-DIAMOND-SHADER-AND-OPTICS.md**](file:///D:/3D-app/docs/reverse-engineering/02-DIAMOND-SHADER-AND-OPTICS.md): Complete disassembly of `DiamondMaterial`, `NormalCapture`, GLSL code, Snell's law, TIR, dispersion, and absorption.
3. [**03-METALS-MATERIALS-AND-LIGHTING.md**](file:///D:/3D-app/docs/reverse-engineering/03-METALS-MATERIALS-AND-LIGHTING.md): PBR parameters, embedded equirectangular HDRI, ground reflections, and color switching logic.
4. [**04-GLB-ASSETS-AND-GEOMETRY.md**](file:///D:/3D-app/docs/reverse-engineering/04-GLB-ASSETS-AND-GEOMETRY.md): Node hierarchy, mesh and vertex counts, Draco compression, and embedded `WEBGI_viewer` metadata.
5. [**05-CUSTOMIZATION-FLOW.md**](file:///D:/3D-app/docs/reverse-engineering/05-CUSTOMIZATION-FLOW.md): End-to-end tracing from UI buttons to 3D scene modifications.
6. [**06-STATE-PRICING-AND-COMMERCE.md**](file:///D:/3D-app/docs/reverse-engineering/06-STATE-PRICING-AND-COMMERCE.md): Evaluation of configuration state, missing commerce features, and a MedusaJS integration schema.
7. [**07-PERFORMANCE-AND-TECHNICAL-DEBT.md**](file:///D:/3D-app/docs/reverse-engineering/07-PERFORMANCE-AND-TECHNICAL-DEBT.md): Memory leaks, G-Buffer overhead, mobile bottlenecks, and prioritized refactoring steps.
8. [**08-OUR-CONFIGURATOR-ARCHITECTURE-OPTIONS.md**](file:///D:/3D-app/docs/reverse-engineering/08-OUR-CONFIGURATOR-ARCHITECTURE-OPTIONS.md): Comprehensive implementation guide for building an open-source React Three Fiber + MedusaJS configurator.
9. [**09-GLOSSARY-AND-LEARNING-GUIDE.md**](file:///D:/3D-app/docs/reverse-engineering/09-GLOSSARY-AND-LEARNING-GUIDE.md): Beginner-friendly visual and conceptual explanations of graphics programming, optics, and jewellery terms.
10. [**10-EVIDENCE-AND-UNKNOWNS.md**](file:///D:/3D-app/docs/reverse-engineering/10-EVIDENCE-AND-UNKNOWNS.md): Traceability index connecting all findings to exact files, lines, and symbols.
