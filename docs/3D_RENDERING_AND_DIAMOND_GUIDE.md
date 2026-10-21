# 3D Rendering Pipeline & Diamond Gemstone Guide

This technical guide provides an in-depth explanation of the Three.js 3D WebGL rendering pipeline, lighting, environment maps, and the forensic investigation and physical solution for rendering realistic cut diamonds and gemstones.

---

## 1. WebGL Scene & Camera Pipeline

### 1.1 Renderer Configuration
Defined in [`src/features/ring-viewer/lib/viewer-setup.ts`](file:///C:/Users/admin/Downloads/3d-jewelry/src/features/ring-viewer/lib/viewer-setup.ts), the WebGL renderer is tuned for luxury jewelry visualization:

```typescript
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
```

- **ACESFilmicToneMapping:** Preserves specular highlights on metal and diamond facet edges without blowing them out into harsh, clipped white patches.
- **Tone Mapping Exposure (1.35):** Boosts internal diamond reflections and ambient gold warm tones to match studio product photography.
- **Pixel Ratio Clamping (`Math.min(devicePixelRatio, 2)`):** Guarantees razor-sharp rendering on Retina/HiDPI screens without GPU performance penalties on mobile.

### 1.2 Telephoto Camera Calibration
Jewelry visualization requires minimal perspective distortion to preserve true prong and diamond proportions. A wide-angle camera would make the front of the ring look unnaturally bulbous.

- **Field of View (FOV):** `15°` (simulating a $200\text{ mm}$ macro telephoto lens).
- **Camera Position:**
  ```typescript
  const mobileFactor = width < 768 ? Math.max(1.0, (768 / width) * 0.88) : 1.0;
  camera.position.set(-0.024 * mobileFactor, 11.51 * mobileFactor, -4.22 * mobileFactor);
  ```
- **OrbitControls Target:** `(0, -0.15, 0)` with smooth damping (`dampingFactor: 0.05`) and polar angle clamped to $\frac{\pi}{2}$ ($90^\circ$) to prevent camera inversion below the ground plane.

---

## 2. Lighting & PMREM Studio Environment

### 2.1 Directional Light Rig
The scene combines 5 directional and ambient light sources:
1. **Ambient Light (1.8 intensity):** Base fill ensuring prongs and shadows do not turn pitch black.
2. **Key Light (3.5 intensity at `(0, 10, -5)`):** Main overhead directional light driving primary specular highlights on the ring crown.
3. **Fill Light (2.0 intensity at `(6, 6, -3)`):** Soft cool-blue fill (`#f0f5ff`) illuminating the right flank of the shank.
4. **Rim Light (2.5 intensity at `(-6, 6, -3)`):** Sharp edge light outlining the left silhouette.
5. **Back Rim Light (1.5 intensity at `(0, 8, 6)`):** Warm fill (`#fff6ea`) catching the inner ring band curvature.

### 2.2 Studio PMREM Environment Map
Diamonds and polished precious metals are almost entirely reflective and refractive; their appearance depends heavily on their environment.

Using Three.js's `PMREMGenerator`, we render an off-screen environment scene containing:
- **Broad Softbox Panels:** Five large white planes ($25\text{ to }35\text{ units}$) providing smooth, continuous gradient reflections across the curved gold band.
- **High-Intensity Specular Light Strips:** Four narrow, ultra-bright panels ($3.0\text{ to }4.0\text{ intensity}$) positioned overhead and diagonally. These sharp highlights create the necessary high-contrast reflections that diamond facets need to scintillate when the ring is rotated.

### 2.3 Contact Shadow Plane
To anchor the ring realistically in 3D space, an elliptical canvas radial gradient texture is mapped onto a plane at $y = -0.52$:
- Core opacity: $75\%$ dark core fading through $55\%$ and $18\%$ to fully transparent at the boundary.
- Depth write disabled (`depthWrite: false`) to prevent z-fighting with the ring geometry.

---

## 3. The Diamond Defect: Root Cause Analysis

### 3.1 Why Did the Diamond Previously Look Bad?
In the initial baseline implementation, the diamond appeared as an **opaque, milky white porcelain egg/opal**:

![Baseline Defect](file:///C:/Users/admin/Downloads/3d-jewelry/baseline-screenshots/baseline-desktop-1440x900.png)

#### Forensic Flaws Identified:
1. **Excessive Diffuse Scattering:**
   In Three.js `MeshPhysicalMaterial`:
   ```typescript
   // Defective Baseline:
   color: new THREE.Color(0xfcfdff),
   transmission: 0.35,
   ```
   In PBR physics, a material's incoming light is divided between diffuse reflection and transmission. With `transmission: 0.35`, **$65\%$ of all light underwent diffuse reflection as solid white albedo (`#fcfdff`)**. This coated the diamond in an opaque, chalky white film!
2. **Destroyed Facet Normals via `flatShading: true`:**
   Enabling `flatShading: true` overrode the analytic vertex normals exported from MatrixGold/Rhino CAD, fracturing curved facets and creating harsh polygonal boundaries.
3. **Missing Volumetric Absorption:**
   There was no `thickness` or `attenuationDistance` defined, preventing Three.js from calculating physical depth refraction through the stone.

---

## 4. The Physical Diamond Solution

### 4.1 The Three.js Transmission Formula
In Three.js standard PBR shaders, transmitted light is computed as:
$$\mathbf{I}_{\text{transmitted}} = \text{transmission} \times \mathbf{C}_{\text{material}} \times \mathbf{I}_{\text{sceneBuffer}}$$

- If $\mathbf{C}_{\text{material}} = \mathbf{0}$ (black), transmitted light is multiplied by 0, rendering the diamond completely black!
- If $\mathbf{C}_{\text{material}} = \mathbf{1}$ (pure white `#ffffff`) and $\text{transmission} = 0.92$, $92\%$ of incoming light refracts through the faceted geometry, while the remaining $8\%$ and the clearcoat reflect crisp specular highlights on every facet face!

### 4.2 The Correct Diamond Material Specification
Defined in [`src/features/ring-viewer/lib/gemstone-materials.ts`](file:///C:/Users/admin/Downloads/3d-jewelry/src/features/ring-viewer/lib/gemstone-materials.ts):

```typescript
export function createGemstoneMaterial(gemstone: GemstoneOption, isCenterstone = true) {
  if (gemstone.id === 'diamond') {
    return new THREE.MeshPhysicalMaterial({
      name: isCenterstone ? 'Gem 01' : 'Gem 02',
      color: new THREE.Color(0xffffff),      // Pure transmission filter
      transmission: 0.92,                    // 92% optical refraction
      opacity: 1.0,
      transparent: true,
      roughness: 0.0,                        // Mirror-polished facet surfaces
      metalness: 0.0,
      ior: 2.417,                            // True diamond refractive index
      reflectivity: 1.0,
      envMapIntensity: isCenterstone ? 4.5 : 3.5, // High specular brilliance
      clearcoat: 1.0,                        // High-sheen outer facet glaze
      clearcoatRoughness: 0.0,
      dispersion: 0.044,                     // Spectral chromatic dispersion (fire)
      thickness: isCenterstone ? 2.5 : 1.2,  // Internal optical depth
      attenuationColor: new THREE.Color(0xffffff),
      attenuationDistance: 10.0,
      flatShading: false,                    // Preserves precision CAD facet normals
    });
  }
}
```

### 4.3 Visual Result After Fix
With this material, the center diamond and side pavé diamonds render with crystal transparency, clear facet definition, refractive depth, and brilliant fire:

![Refactored Result](file:///C:/Users/admin/Downloads/3d-jewelry/post-refactor-screenshots/diamond-detail.png)

---

## 5. Colored Gemstone Formulas

For colored gemstones (Sapphire, Ruby, Emerald, Aquamarine, Morganite, Moissanite), physical volume absorption is achieved by setting both `color` (the transmission tint) and `attenuationColor` to the gemstone's characteristic hue:

| Gemstone | Color / Tint | Transmission | IOR | Attenuation Distance |
| :--- | :--- | :--- | :--- | :--- |
| **Diamond** | `#ffffff` | $0.92$ | $2.417$ | $10.0$ |
| **Blue Sapphire** | `#1e3a8a` | $0.85$ | $1.770$ | $4.0$ |
| **Ruby** | `#be123c` | $0.85$ | $1.770$ | $4.0$ |
| **Emerald** | `#047857` | $0.85$ | $1.580$ | $4.0$ |
| **Aquamarine** | `#67e8f9` | $0.90$ | $1.577$ | $6.0$ |
| **Morganite** | `#f472b6` | $0.88$ | $1.585$ | $5.0$ |
| **Moissanite** | `#ffffff` | $0.94$ | $2.650$ | $12.0$ |

---

## 6. 3D Model Structure & DRACO Pipeline

The 3D ring is assembled from three separate modular CAD scenes loaded via DRACO-compressed glTF:

1. **`sh_pave_1.glb` (Shank):** The metal band with prongs and accent pavé diamonds.
2. **`hd_oval_10.glb` (Head / Crown):** Contains the center 4-prong setting and `mesh_21` (the 1.0ct oval diamond geometry with 2,143 vertices and 11,904 facet indices). Positioned at $(0, 0.13, 0)$ and scaled $(0.13, 0.13, 0.13)$.
3. **`et_plain_03.glb` (Eternity Band):** Stackable band positioned at $(0, 0, 0.32)$ tucked flush against the shank.

### Carat Scaling Algorithm
When the user selects a different carat weight ($0.50\text{ ct}$ to $3.00\text{ ct}$), the head group is dynamically scaled in 3D:
$$s = \text{selectedCarat.scale}$$
$$\text{headMeshGroup.scale.set}(s, s, s)$$
This smoothly resizes the diamond and its prongs without needing to reload the 3D model!
