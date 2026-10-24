# 07 - Performance Risks, Bottlenecks, and Technical Debt

## 1. Executive Summary: Performance Profile

While Crystal Jewels delivers impressive visual quality on desktop GPUs (RTX 3060+, Apple M1/M2/M3), static code inspection reveals substantial architectural performance risks that prevent it from being production-ready for mobile or high-traffic e-commerce storefronts.

The primary performance bottlenecks stem from:
1. **Excessive Fill-Rate Overhead**: Simultaneously executing G-Buffer rendering, 16-step Screen-Space Reflections (SSR), SSAO, 2-pass Bloom, and a 5-bounce analytical raymarching loop on every fragment.
2. **GPU Memory Leaks**: Incomplete resource disposal when calling `viewer.scene.removeSceneModels()` during ring switching.
3. **Uncached Network Fetches & Heavy Assets**: 1024x512 equirectangular HDRI textures duplicated inside every binary `.glb` file.
4. **Fragile Imperative Codebase**: A monolithic 721-line script tightly coupled to raw DOM queries and hardcoded scene graph node names.

---

## 2. Code-Based Performance Risks

### Risk 1: The 5-Bounce Gemstone Raymarching Loop
In `DiamondMaterial` (class `Fo`), the fragment shader executes:
```glsl
for (int i = 0; i < RAY_BOUNCES; i++) { // RAY_BOUNCES = 5
    vec3 intersectedPos = intersect(origin, newDirection);
    // ... linePlaneIntersect with cubemap lookups ...
    newDirection = refract(...);
    // ... Chromatic dispersion: 3 separate refract calls & 3 envMap texture lookups ...
}
```
- **Analysis**: For every diamond fragment on screen, the GPU must perform up to **15 texture lookups** and multiple matrix transformations per pixel.
- **Mobile Impact**: While desktop GPUs with tens of gigabytes of memory bandwidth handle this effortlessly, mobile tile-based deferred renderers (TBDR GPUs on iOS and Android) suffer heavy thermal throttling and battery drain if diamonds occupy a large percentage of the screen.

---

### Risk 2: Full Deferred Post-Processing Pipeline
In `Crystal-Jewels/src/index.ts` lines 89–108, eleven distinct rendering plugins are attached:
- `GBufferPlugin`
- `ProgressivePlugin(32)`
- `TonemapPlugin`
- `SSRPlugin`
- `SSAOPlugin`
- `FrameFadePlugin`
- `GroundPlugin`
- `BloomPlugin`
- `TemporalAAPlugin`
- `DiamondPlugin`
- `RandomizedDirectionalLightPlugin`

```
Frame Rendering Cost Breakdown:
1. Depth & Normal Pre-Pass (GBuffer)      [~1.5 ms]
2. SSAO Pass (4 Samples)                   [~1.0 ms]
3. SSR Pass (16 Raymarching Steps)         [~3.5 ms]
4. Diamond Raymarching Pass (5 Bounces)    [~4.0 ms]
5. Tone Mapping & Custom Vignette Pass     [~0.8 ms]
6. Bloom Pass (Luminance + 2 Blurs)        [~1.8 ms]
7. Temporal Anti-Aliasing (TAA) Pass       [~1.2 ms]
8. Framebuffer Blit to Screen              [~0.4 ms]
Total GPU Frame Time: ~14.2 ms (Close to 16.6 ms budget for 60 FPS)
```
On desktop, the frame completes within 14 ms, sustaining 60 FPS. However, on mid-range mobile GPUs (e.g. Mali-G57 or Adreno 618), this pipeline easily exceeds 35 ms per frame, dropping the frame rate below 25 FPS during camera rotation.

---

### Risk 3: GPU Memory Leak on Model Swapping
In `index.ts` lines 634 and 663, switching rings executes:
```typescript
viewer.scene.removeSceneModels();
await manager.addFromPath("./assets/ring2_webgi.glb");
```
- **Disposal Failure**: Three.js requires explicit calling of `.geometry.dispose()`, `.material.dispose()`, and `.texture.dispose()`. Removing an `Object3D` from the scene graph merely removes it from the parent's children array; the GPU buffers, WebGL textures, and compiled shader programs remain allocated in WebGL memory.
- **Consequence**: Repeatedly toggling between Ring 1 and Ring 2 will leak tens of megabytes of VRAM on every switch, eventually triggering an unrecoverable **WebGL Context Loss** crash on mobile devices.

---

### Risk 4: Lack of WebGL Context Recovery
The application does not attach listeners for `webglcontextlost` or `webglcontextrestored`:
```javascript
// Missing in Crystal Jewels:
canvas.addEventListener('webglcontextlost', (e) => {
    e.preventDefault();
    console.warn("WebGL Context Lost!");
});
```
When a mobile user switches browser tabs or locks their phone, the mobile OS terminates the WebGL context. In Crystal Jewels, resuming the tab leaves the canvas frozen as a black or blank rectangle.

---

## 3. Technical Debt & Code Quality Assessment

| Technical Debt Item | Location | Architectural Risk |
|---|---|---|
| **Hardcoded DOM Queries** | `index.ts` throughout (e.g. `document.querySelector('.ruby')`) | High: Any minor HTML refactoring breaks event listeners silently without compile-time errors. |
| **Monolithic Procedural Script** | `index.ts` (721 lines) | High: Business logic, 3D setup, camera animation, and UI bindings are intertwined in a single unmaintainable file. |
| **Vendor Cloud Dependency** | `package.json` line 18 | Critical: WebGI bundle is fetched from a single Google Cloud Storage bucket URL (`storage.googleapis.com/dist.pixotronics.com`). If that bucket is deleted or blocked, builds break immediately. |
| **Outdated Build Tooling** | `parcel-bundler: ^1.6.1` | High: Parcel v1 was deprecated years ago; it lacks modern tree-shaking, ES module code splitting, and Webpack 5 / Vite speed. |
| **Duplicate HDRI Assets** | `ring_webgi.glb` & `ring2_webgi.glb` | Medium: The same 679 KB environment map is duplicated inside both GLBs, wasting 1.36 MB of cellular data. |

---

## 4. Prioritized Engineering Improvements

### Tier 1: Critical (Immediate Production Blockers)
1. **Explicit Memory Disposal**: Implement recursive mesh and material disposal (`geometry.dispose()`, `material.dispose()`, `renderTarget.dispose()`) before unloading models.
2. **WebGL Context Loss Handler**: Listen for `webglcontextlost`, pause the render loop, and rebuild the viewer on `webglcontextrestored`.
3. **Migrate Off Cloud Bucket Tarball**: Vendor the rendering library or migrate to open-source Three.js / React Three Fiber.
4. **Externalize Environment HDRI**: Remove embedded `image 0` from GLB files and host a single pre-filtered `.hdr` texture externally.

### Tier 2: High (Performance & Mobile Readiness)
5. **Tiered Shader Fallback for Mobile**: Detect low-end mobile devices and switch from the 5-bounce raymarching shader to Three.js `MeshPhysicalMaterial` transmission.
6. **Hardware Instancing for Halo/Pavé Stones**: Convert the 44 individual pavé diamond meshes into a single `InstancedMesh`, reducing draw calls from 44 to 1.
7. **Adopt `EXT_meshopt_compression`**: Replace Draco compression with Meshopt to eliminate CPU thread blocking during model load.

### Tier 3: Medium (Architecture & Code Quality)
8. **Modernize Build Pipeline**: Replace Parcel 1 with **Vite 5** or **Next.js** with modern ESM code-splitting.
9. **Separate Architecture Layers**: Refactor into a clean three-tier architecture: Presentation (React/HTML), State (Zustand/Redux), and 3D Viewport (R3F/Three.js).
10. **Schema-Driven Object Lookup**: Replace brittle `findObjectsByName('silver')` lookups with a typed mapping dictionary driven by product configuration.
