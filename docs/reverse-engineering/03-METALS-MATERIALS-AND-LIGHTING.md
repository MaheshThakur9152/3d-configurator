# 03 - Metals, Materials, and Lighting Investigation

## 1. Executive Summary: The Metallic Pipeline

The realistic gold, silver, and rose-gold appearances of the ring bands and settings in Crystal Jewels are achieved through a combination of:
1. **Mesh Separation**: Physical separation of the shank, prongs, and halo into distinct sub-meshes (`gold` and `silver` in Ring 1; `entourage` and `alliance` in Ring 2).
2. **Physically Based Rendering (PBR)**: Powered by WebGI's `MeshStandardMaterial2` (a subclass of Three.js `MeshPhysicalMaterial`).
3. **Extreme Polish Parameters**: Zero roughness (`roughness = 0.0`) and high metalness (`metalness = 0.91` to `1.0`), turning the metal into an almost perfect mirror.
4. **Embedded 1024x512 Equirectangular HDRI**: A dedicated studio lighting environment baked directly into the binary GLB files.
5. **Real-Time Color Mutation**: Runtime customization modifies only the diffuse color vector (`.material.color`) in place, reusing the identical geometry and material instances.

---

## 2. Mesh Structure: Shank vs. Setting

Inspection of `ring_webgi.glb` and `ring2_webgi.glb` using our GLB parser confirms that the metallic geometry is split into separate nodes to enable two-tone customization:

### Ring 1 (`ring_webgi.glb`):
- **Node 6 (`'gold'`)**:
  - Represents the main ring shank (the finger band).
  - Assigned Material 7 (`'gold'`).
  - Initial glTF parameters: `baseColorFactor = [0.738, 0.468, 0.153, 1.0]` (warm yellow gold), `roughness = 0.0`, `metalness = 1.0`.
- **Node 7 (`'silver'`)**:
  - Represents the prong head, basket, and diamond setting.
  - Assigned Material 8 (`'silver'`).
  - Initial glTF parameters: `baseColorFactor = [1.0, 1.0, 1.0, 1.0]`, `roughness = 0.0`, `metalness = 0.91`.

### Ring 2 (`ring2_webgi.glb`):
- **Node 61 (`'alliance'`)**:
  - The bottom wedding-style band.
  - Assigned Material 4 (`'metal'`).
- **Node 62 (`'entourage'`)**:
  - The upper halo setting enclosing the center diamond.
  - Assigned Material 4 (`'metal'`).

---

## 3. PBR Material Model: `MeshStandardMaterial2`

In `Crystal-Jewels/src/index.ts` lines 143, 148–150, the metallic meshes are typed as:
```typescript
let ring: Mesh<BufferGeometry, MeshStandardMaterial2>,
    gold: Mesh<BufferGeometry, MeshStandardMaterial2>,
    silver: Mesh<BufferGeometry, MeshStandardMaterial2>;
```

Inspection of `scratch/types/package/extras/asset_manager/threejs/MeshStandardMaterial2.d.ts` reveals:
```typescript
export declare class MeshStandardMaterial2 extends MeshPhysicalMaterial implements IMaterial {
    // Inherits standard physical PBR properties:
    color: Color;
    roughness: number;
    metalness: number;
    clearcoat: number;
    reflectivity: number;
    envMapIntensity: number;
}
```

### Parameter Breakdown in Crystal Jewels:

| Material Property | Value | Optical Role |
|---|---|---|
| **`metalness`** | `0.91 – 1.0` | Eliminates diffuse Lambertian reflection; 100% of incoming light is treated as specular reflection tinted by the base color. |
| **`roughness`** | `0.0` | Creates a mirror-smooth microfacet surface with zero micro-facet scattering (sharp, undistorted reflections). |
| **`clearcoat`** | `0.0` | Disabled; clearcoat is for lacquered surfaces (e.g. car paint) and is optically incorrect on polished solid precious metals. |
| **`ior`** | `1.50` | Standard dielectric base index (stored in `KHR_materials_ior` extension). |
| **`envMapIntensity`** | `1.0` | Standard 1:1 radiance intensity scaling from the environment map. |

---

## 4. Runtime Metal Customization & Color Presets

Metal customization does **not** swap models or recompile shaders. In `Crystal-Jewels/src/index.ts` lines 554–597, clicking a preset invokes `changeMaterialColor()`:

```typescript
// Crystal-Jewels/src/index.ts (lines 593-597)
function changeMaterialColor(_firstColor: Color, _secondColoor: Color) {
    silver.material.color = _firstColor;
    gold.material.color = _secondColoor;
    usingCustomColors = true;
}
```

### Verified Metal Color Matrix:

| Preset Name | UI Class | Primary Metal (`silver` / Setting) | Secondary Metal (`gold` / Shank) | Visual Result |
|---|---|---|---|---|
| **Default** | `.default` | `#ffffff` (Pure White) | `#fea04d` (Warm Yellow) | Two-tone White Gold head + Yellow Gold shank |
| **Silver-Gold** | `.silver-gold` | `#fea04d` (Warm Yellow) | `#ffffff` (Pure White) | Yellow Gold head + White Gold shank |
| **Silver-Silver** | `.silver-silver`| `#ffffff` (Pure White) | `#ffffff` (Pure White) | All White Gold / Platinum |
| **Gold-Gold** | `.gold-gold` | `#fea04d` (Warm Yellow) | `#fea04d` (Warm Yellow) | All 18K Yellow Gold |
| **Rose-Silver** | `.rose-silver` | `#ffffff` (Pure White) | `#fa8787` (Soft Rose) | White Gold head + Rose Gold shank |
| **Gold-Rose** | `.gold-rose` | `#fa8787` (Soft Rose) | `#fea04d` (Warm Yellow) | Rose Gold head + Yellow Gold shank |
| **Rose-Rose** | `.rose-rose` | `#fa8787` (Soft Rose) | `#fa8787` (Soft Rose) | All 18K Rose Gold |

> [!NOTE]
> White gold, platinum, and silver are not physically distinct materials in this configurator; they all use the identical `#ffffff` hex color with `metalness = 0.91` and `roughness = 0.0`.

---

## 5. Lighting, Shadows, and Environment Maps

### The Secret HDRI Inside the Binary GLB
A major mystery in the codebase was how the metals reflect a realistic photography studio without any external `.hdr` or `.exr` file referenced in `index.ts`.

Binary extraction of `assets/ring_webgi.glb` resolved this:
- The GLB contains **`image 0`** (bufferView 0, taking **679,604 bytes** out of the 972,836 byte total file size—**70% of the entire asset!**).
- Decoding the binary header reveals a **1024x512 RGBA equirectangular panorama**.
- In `scenes[0].extensions['WEBGI_viewer'].resources.textures['0601f592-24b1-4017-8e41-360273b2632c']`:
  ```json
  {
    "type": "Texture",
    "mapping": 303,       // EquirectangularReflectionMapping in Three.js
    "format": 1023,      // RGBAFormat
    "image": "b8441821-709b-4309-b95e-4c749e4cd232" // Points to Image 0
  }
  ```
- When `manager.addFromPath("./assets/ring_webgi.glb")` is executed, WebGI's loader automatically extracts this embedded texture, sets it as `viewer.scene.environment`, and generates pre-filtered radiance maps (PMREM) for the metals.

### Ground Reflections and Shadows
In `Crystal-Jewels/src/index.ts` line 105, the application registers:
```typescript
await viewer.addPlugin(GroundPlugin);
await viewer.addPlugin(RandomizedDirectionalLightPlugin, false);
```
- **Ground Reflection**: `GroundPlugin` creates an invisible virtual ground plane below the ring ($Y \approx -1.0$) that receives contact reflections from the gold shank and cast shadows from the diamond.
- **Directional Shadow**: `RandomizedDirectionalLightPlugin` adds a virtual key light that casts an orthographic soft shadow onto the ground plane, anchoring the ring so it does not appear to float in empty space.

---

## 6. What Happens Without an Environment Map?

In physically based rendering (PBR), pure metals (`metalness = 1.0`, `roughness = 0.0`) have **zero diffuse reflection**. They do not scatter light uniformly according to Lambert's cosine law ($I \propto \cos \theta$). Instead, 100% of their visible surface color is determined by the specular reflection equation:

$$L_o(v) = \int_{\Omega} f_r(l, v) L_i(l) (n \cdot l) dl$$

Where $f_r$ is the Cook-Torrance specular BRDF:

$$f_r = \frac{D \cdot F \cdot G}{4 (n \cdot l) (n \cdot v)}$$

Because roughness is $0.0$, the microfacet distribution function $D$ collapses into a Dirac delta function ($\delta$), meaning a given surface point can only reflect light coming from the single exact reflection vector:

$$r = 2(n \cdot v)n - v$$

### The Visual Failure Without HDRI:
If this ring is loaded into a Three.js scene illuminated only by standard point lights or ambient lights without an environment map:
1. **Total Blackness**: Every surface pixel whose reflection vector $r$ does not directly intersect the tiny spherical radius of a point light will receive $L_i(r) = 0$. The ring shank will render as an unrecognizable pitch-black silhouette.
2. **Missing Volumetric Form**: The curvature, bevels, and polished cylindrical contours of the ring shank become invisible because there are no studio gradients, softboxes, or ceiling reflections to contour the geometry.
3. **Flat Color Fails**: Even setting `silver.material.color = 0xffffff` has zero effect; pure white multiplied by zero incoming radiance is black ($1.0 \times 0.0 = 0.0$).

> [!IMPORTANT]
> For any production jewellery configurator, **environment lighting is at least 70% of the visual fidelity**. A well-tuned studio HDRI with softbox light cards produces luxury-grade metals even on basic PBR materials.
