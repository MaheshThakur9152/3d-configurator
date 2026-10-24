# 09 - Glossary and Graphics Learning Guide

## 1. Overview

This guide explains key technical terms in 3D graphics, real-time rendering, diamond optics, and digital jewellery CAD in beginner-friendly language, with concrete examples grounded in the **Crystal Jewels** codebase.

---

## 2. Core 3D Graphics & WebGL Concepts

### WebGL & GPU Rendering
- **Explanation**: **WebGL (Web Graphics Library)** is a browser JavaScript API that allows web pages to communicate directly with your computer or smartphone's graphics processing unit (GPU). The GPU contains thousands of small processor cores that calculate colors for millions of screen pixels simultaneously (in parallel), which is necessary to render 3D scenes at 60 frames per second.
- **Repository Context**: In `Crystal-Jewels/src/index.ts` lines 48–53, the application creates a `ViewerApp` connected to the `<canvas id="webgi-canvas">`, commanding the GPU via WebGL 2.0.

---

### Mesh, Geometry, Vertices, Normals, and Facets
- **Vertex (plural: Vertices)**: A single coordinate point in 3D space $(X, Y, Z)$.
- **Normal**: An imaginary perpendicular arrow pointing outward from a surface. The GPU uses normal vectors to calculate how light bounces off surfaces.
- **Face / Facet**: A flat polygon (usually a triangle) formed by connecting 3 vertices.
- **Mesh**: The complete 3D object formed by a collection of connected facets (geometry) combined with a material.
- **Repository Context**: In `assets/ring_webgi.glb`, the primary diamond (`Mesh 4`) contains **556 vertices** and **314 triangular facets** representing the 57 facets of an authentic round brilliant cut.

---

### glTF and GLB
- **glTF (Graphics Language Transmission Format)**: The standard open format (often called "the JPEG of 3D") used to transmit 3D models efficiently over the web.
- **GLB**: The binary, self-contained version of glTF. It packages the 3D model's node hierarchy, geometry buffers, animation tracks, and embedded textures into a single compact binary file.
- **Repository Context**: `assets/ring_webgi.glb` (972 KB) packages 8 meshes, 9 materials, and an embedded 1024x512 environment map texture into one file.

---

### Shader, Vertex Shader, and Fragment Shader
- **Shader**: A small program written in **GLSL (OpenGL Shading Language)** that executes directly on the GPU cores.
- **Vertex Shader**: Executes once for every vertex in a 3D model. Its primary job is to multiply the 3D vertex position by camera matrices to determine where the point appears on your 2D computer screen.
- **Fragment Shader (Pixel Shader)**: Executes once for every pixel (fragment) covered by the 3D model on screen. Its job is to calculate the final color of that pixel, taking into account lighting, shadows, reflections, and transparency.
- **Repository Context**: WebGI's `DiamondMaterial` (class `Fo` in `bundle.m.js`) uses a custom fragment shader that calculates Snell's Law refraction and bounces rays through the diamond facets.

---

## 3. Materials, Optics & Lighting Terminology

### PBR (Physically Based Rendering)
- **Explanation**: A modern computer graphics approach that simulates materials using real-world physical laws (such as conservation of energy and microfacet theory), ensuring surfaces look realistic under any lighting condition.
- **Repository Context**: The ring's metal shank uses WebGI's `MeshStandardMaterial2`, an extension of Three.js `MeshPhysicalMaterial`.

---

### Metalness and Roughness
- **Metalness**: A slider from `0.0` (non-metal / dielectric, like wood or plastic) to `1.0` (pure conductor metal, like gold, silver, or platinum). Non-metals reflect white highlights while retaining their diffuse body color; pure metals have no diffuse color and tint all specular reflections with their metallic base color.
- **Roughness**: A slider from `0.0` (perfect mirror polish) to `1.0` (matte / chalky surface). High roughness scatters reflected light rays in random directions; low roughness produces crisp, sharp mirror reflections.
- **Repository Context**: The gold and silver ring bands in `ring_webgi.glb` have `roughness = 0.0` and `metalness = 1.0`, producing a mirror-polished jewellery shine.

---

### Environment Map, HDRI, and PMREM
- **HDRI (High Dynamic Range Image)**: A 360-degree panoramic photograph that stores true physical brightness values, including intense light sources like light bulbs and the sun.
- **Environment Map**: Wrapping an HDRI around the 3D scene like a giant sphere, allowing shiny objects to reflect the surrounding room or photography studio.
- **PMREM (Prefiltered Mipmapped Radiance Environment Map)**: Precomputing blurred versions of the HDRI at different roughness levels so rough surfaces can sample realistic reflections quickly without noise.
- **Repository Context**: `ring_webgi.glb` embeds a 1024x512 equirectangular studio panorama (`image 0`, 679 KB) that provides realistic softbox reflections for the gold band.

---

### IOR (Index of Refraction)
- **Explanation**: A number measuring how much light slows down and bends when entering a transparent material from air.
  - Air = $1.00$
  - Water = $1.33$
  - Window Glass = $1.52$
  - Sapphire = $1.77$
  - **Diamond = 2.42**
- **Repository Context**: In `DiamondMaterial` (class `Fo`), `refractiveIndex` is configured to `2.40`. This high IOR causes light rays entering the diamond to bend sharply.

---

### Refraction, Fresnel Reflection, and Total Internal Reflection (TIR)
- **Refraction (Snell's Law)**: The bending of light as it passes across the boundary between two different media (e.g. from air into diamond).
- **Fresnel Reflection**: The phenomenon where surfaces become more reflective when viewed at shallow, glancing angles. For diamond, about 17% of light reflects off the table facet at normal incidence ($F_0 \approx 0.17$), while almost 100% reflects at glancing edges.
- **Total Internal Reflection (TIR)**: When light travelling inside a dense medium (like diamond) hits the boundary of a less dense medium (air) at an angle steeper than the "critical angle" ($\theta_c \approx 24.4^\circ$), the light **cannot escape**. Instead, 100% of the light reflects internally like a perfect mirror. This is the fundamental reason cut diamonds sparkle with intense brilliance rather than letting light leak out the bottom.
- **Repository Context**: In `DiamondMaterial.traceRay()`, TIR is detected with `if (dot(newDirection, newDirection) < epsilon) { newDirection = reflect(oldDir, mappedNormal); }`.

---

### Chromatic Dispersion ("Fire")
- **Explanation**: In real gemstones, different colors (wavelengths) of light travel at slightly different speeds, meaning Red light bends slightly less than Blue light. When white light passes through multiple diamond facets, it splits into a spectrum of rainbow flashes—a quality gemologists call **fire**.
- **Repository Context**: In `DiamondMaterial`, dispersion is simulated by calculating three separate refracted ray directions (`dir0` for green, `dir1` for red at IOR $+ 0.012$, and `dir2` for blue at IOR $- 0.012$) and sampling the environment map independently for each channel.

---

### Tone Mapping & Bloom
- **Tone Mapping**: The mathematical algorithm that compresses high dynamic range (HDR) lighting values (which can exceed $10.0$ or $100.0$) down to the standard $[0.0, 1.0]$ color range of computer and phone screens without clipping bright areas into ugly flat white patches.
- **Bloom**: An optical post-processing effect that detects extremely bright pixels (such as direct diamond glints) and bleeds a soft, glowing halo into adjacent pixels, simulating the light scatter that occurs inside human eyes and camera lenses.
- **Repository Context**: WebGI's `TonemapPlugin` applies ACES-filmic tone mapping, and `BloomPlugin` creates soft photographic glows on the diamond's brightest facet flashes.

---

## 4. Digital Jewellery Terminology

```
                   Round Brilliant Cut Anatomy
             ┌───────────────── Table ─────────────────┐
             │                                         │
       Crown ├─────────────► /\       /\ ◄─────────────┤
             │              /  \     /  \              │
      Girdle ├─────────────[====]───[====]─────────────┤
             │              \           /              │
    Pavilion ├───────────────\         /───────────────┤
             │                \       /                │
       Culet └─────────────────► \./ ◄─────────────────┘
```

- **Table**: The large, flat horizontal facet at the very top of the gemstone.
- **Crown**: The upper portion of the diamond above the girdle.
- **Girdle**: The narrow outer perimeter band dividing the crown from the pavilion.
- **Pavilion**: The lower conical portion of the diamond that tapers down to the bottom point.
- **Culet**: The tiny facet or point at the very bottom of the pavilion.
- **Shank**: The circular metal band of the ring that wraps around the finger.
- **Head / Setting**: The upper metal structure (including prongs and basket) that securely holds the gemstone.
- **Prongs**: The small metal claws that grasp the diamond at its girdle.
- **Pavé**: A setting technique where dozens of tiny diamonds are set closely together along the ring band, creating the appearance of a paved surface of sparkle.
- **Halo**: A ring of smaller accent diamonds encircling the central gemstone.

---

## 5. Architectural & Software Concepts

### Render Loop & Scene Graph
- **Scene Graph**: A hierarchical tree structure of 3D objects. When a parent node (e.g. `ring`) rotates, all child nodes (`gold`, `silver`, `diamonds`) automatically inherit that rotation.
- **Render Loop**: A continuous loop executed via `requestAnimationFrame` (typically 60 times per second) that updates object positions and commands the GPU to redraw the canvas.

---

### Parametric CAD vs. Prebuilt Mesh Swapping
- **Prebuilt Mesh Swapping (Crystal Jewels Approach)**: The 3D artist exports static 3D models for every variation. To change the ring, the app completely deletes the current model and loads a new file over the network.
- **Parametric CAD (Production Approach)**: The 3D model is controlled by numerical parameters (ring diameter in millimeters, diamond carat weight, prong thickness). Modifying a slider recalculates vertex positions dynamically using mathematical formulas, morph targets, or procedural geometry.
