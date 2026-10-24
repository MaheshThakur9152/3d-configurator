# 09 - Performance Benchmarks, Optimization, and Testing Strategy

## 1. Executive Summary

This document specifies the performance engineering architecture, memory management protocols, and automated testing strategy for the 3D jewellery configurator.

Rendering high-IOR gemstones with dispersion and mirror-polished metals can saturate mobile GPU fragment pipelines if unconstrained. To maintain **60 FPS on desktop** and **stable 45–60 FPS on mobile**, the system implements:
1. **Dynamic Quality Tiers (High, Medium, Low)**.
2. **Adaptive Canvas Device Pixel Ratio (DPR) Clamping**.
3. **Demand-Driven Rendering (Pausing when idle)**.
4. **Deterministic WebGL Context Loss Recovery**.
5. **Hardware Instancing for Pavé Diamonds**.

---

## 2. Adaptive Quality Tiers

The configurator inspects GPU capabilities and screen form factors on initialization via `QualityManager`:

| Quality Parameter | High Tier (Desktop / Discrete GPU) | Medium Tier (Modern Mobile / Tablet) | Low Tier (Budget Mobile / Low Battery) |
|---|---|---|---|
| **Canvas DPR** | `window.devicePixelRatio` (Max 2.0) | `Math.min(window.devicePixelRatio, 1.5)` | Clamped strictly to `1.0` |
| **Diamond Shader** | 5 internal bounces + chromatic dispersion | 3 internal bounces + fast chromatic split | Standard physical transmission / 1 bounce |
| **Shadows** | Soft contact shadow map (1024x1024) | Directional shadow map (512x512) | Baked static contact shadow plane |
| **Pavé Stones** | Individual refractive facet shaders | Instanced geometry with simplified shader | Polished specular PBR placeholder |
| **Post-Processing** | Subtle bloom + FXAA / TAA | Lightweight FXAA; Bloom disabled | Zero post-processing |
| **Target FPS** | **60 FPS** | **60 FPS** | **30 - 45 FPS** |

---

## 3. Demand-Driven Rendering & Idle GPU Conservation

Standard Three.js loops execute continuously 60 times per second even when the user is reading text, draining laptop batteries and heating mobile devices.

The configurator implements **demand-driven rendering**:
1. When user rotates, zooms, or changes options $\to$ Render loop runs continuously at 60 FPS.
2. When interaction ceases $\to$ Renders 5 sub-pixel settling frames, then enters an **idle sleep state**.
3. While idle $\to$ Zero GPU draw calls executed; power consumption drops to 0%.
4. Any touch, mouse move, or option click instantly wakes the render loop.

---

## 4. WebGL Context Loss Detection & Recovery

Mobile browsers frequently terminate the WebGL rendering context when the user switches tabs, locks the screen, or runs out of VRAM.

### Recovery Protocol (`RendererProvider.tsx`):
```typescript
const canvas = canvasRef.current;

canvas.addEventListener('webglcontextlost', (event: Event) => {
  event.preventDefault(); // Prevents browser from permanently disabling WebGL
  console.warn('[3D Configurator] WebGL Context Lost. Pausing render loop...');
  setIsContextLost(true);
  cancelAnimationFrame(animationFrameId);
});

canvas.addEventListener('webglcontextrestored', () => {
  console.info('[3D Configurator] WebGL Context Restored. Rebuilding scene graph...');
  MaterialRegistry.clearCache();
  AssetLoader.clearCache();
  reinitializeScene();
  setIsContextLost(false);
});
```

---

## 5. Pavé Diamond Hardware Instancing

In Ring 2 (`ring2_webgi.glb`), the shank is lined with **44 pavé diamonds**. In Three.js, rendering 44 individual meshes triggers 44 separate draw calls, stalling the CPU-GPU command buffer.

### Solution: `THREE.InstancedMesh`
By converting the 44 small pavé diamonds into a single `THREE.InstancedMesh(geometry, material, 44)`:
- Draw calls drop from **44 to 1**.
- Geometry is uploaded to VRAM once (saving 95% geometry buffer storage).
- The 44 positions are stored in a single flat transformation matrix array (`Float32Array(44 * 16)`).

---

## 6. Automated Testing Strategy

```
+─────────────────────────────────────────────────────────────────────────────+
|                         AUTOMATED TEST SUITE                                |
+─────────────────────────────────────────────────────────────────────────────+
                                                                               
   [ 1. Contract & Schema Tests ]                                              
   - Validates RingConfigurationSchema with valid/invalid inputs               
   - Verifies compatibility rules (e.g. emerald cut prong constraints)         
   - Tests JSON serialization and URL hash encoding                            
                                                                               
   [ 2. Backend API Integration Tests ]                                        
   - GET /api/configurator/products/:id returns correct manifest               
   - POST /api/configurator/pricing/calculate returns exact formula output      
   - POST /api/configurator/configurations saves and retrieves by ID           
                                                                               
   [ 3. Material & Registry Unit Tests ]                                       
   - Confirms MaterialRegistry returns valid Three.js materials for all IDs    
   - Verifies PBR parameters match calibration matrix                          
   - Tests in-place uniform updates without memory leak                        
                                                                               
   [ 4. Storefront Messenger Protocol Tests ]                                  
   - Tests postMessage dispatching and allowed origin filtering                
   - Verifies parent payload validation                                        
```

---

## 7. Repeatable Benchmark Reporting Procedure

When recording performance benchmarks on staging or production hardware, engineers must record:
1. **Device**: (e.g., iPhone 14 Pro, Samsung Galaxy S22, MacBook Pro M2).
2. **Browser & Version**: (e.g., Safari iOS 17.2, Chrome 122).
3. **Canvas Dimensions & DPR**: (e.g., $1080 \times 1920$ @ DPR 1.5).
4. **Active Model & Triangle Count**: (e.g., Solitaire Cathedral, 14,848 triangles).
5. **Measurement Tool**: Chrome DevTools Performance Profiler / Spector.js.
6. **Reported Metrics**: Steady-state FPS, peak frame time (ms), and VRAM footprint (MB).
