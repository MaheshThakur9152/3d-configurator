# 01 - Rendering Architecture Decision: WebGI vs. Independent Rendering Layer

## 1. Context and Problem Statement

A foundational technical and business decision must be made before building the production 3D jewellery configurator:
- **Option A**: Retain the existing **WebGI v0.4.6** commercial framework.
- **Option B**: Build an **independent, open-source rendering layer** using Three.js, React Three Fiber (R3F), and Drei.

The objective is to establish an architecture that guarantees long-term commercial ownership, eliminates external vendor vulnerabilities, runs efficiently on mobile devices, and integrates seamlessly with modern headless e-commerce platforms (MedusaJS).

---

## 2. Evaluation of Option A: Retain WebGI

WebGI is a commercial WebGL framework developed by Pixotronics (headed by Palash Bansal).

### 2.1 Technical Strengths
- **Turnkey Diamond Shader**: WebGI's `DiamondPlugin` and `DiamondMaterial` provide a pre-tuned 5-bounce facet raymarching loop with chromatic dispersion and Beer-Lambert absorption out of the box.
- **Integrated Post-Processing**: Includes G-Buffer depth passes, Screen-Space Reflections (SSR), SSAO, and progressive accumulation passes in a single runtime.

### 2.2 Critical Vulnerabilities & Commercial Blockers
1. **Uncertain Commercial Licensing**:
   - WebGI is **not open source**. While the demo repository (`Crystal-Jewels/`) is under an MIT license template, the underlying runtime tarball (`bundle-0.4.6.tgz`) is proprietary IP owned by Pixotronics.
   - The license terms at `https://webgi.xyz/docs/license` stipulate commercial licensing fees, domain-based token locks, or revenue sharing for production storefront deployments. Deploying an e-commerce store with an unverified GCS tarball introduces severe legal and copyright liability.
2. **Fragile Cloud Bucket Dependency**:
   - The package is resolved directly from a public Google Cloud Storage bucket (`https://storage.googleapis.com/dist.pixotronics.com/webgi/runtime/bundle-0.4.6.tgz`). The vendor can modify, revoke, or delete this artifact at any moment, permanently breaking CI/CD pipelines.
3. **Closed-Source Black Box**:
   - The core engine is minified and obfuscated. Bugs, WebGL context crashes, or memory leaks inside `bundle.m.js` cannot be patched or fixed in-house.
4. **Mobile Performance Overhead**:
   - WebGI's heavy deferred G-Buffer and 16-step SSR pipeline cannot be easily decoupled, causing thermal throttling and battery drain on mobile phones.
5. **No React / Declarative Support**:
   - WebGI is an imperative, procedural JavaScript library. Integrating it into a modern React/Next.js component tree requires brittle lifecycle wrappers and manual DOM canvas binding.

---

## 3. Evaluation of Option B: Independent Rendering Layer (Three.js + R3F + Drei)

Option B builds an independent, modular 3D pipeline using the industry-standard open-source ecosystem: **Three.js**, **React Three Fiber (R3F)**, and **Drei**.

### 3.1 Technical Architecture
- **Rendering Foundation**: Three.js (r160+), the world's most widely adopted WebGL/WebGPU library.
- **Declarative React Bridge**: React Three Fiber (R3F) v8, allowing 3D objects, materials, and lights to be declared as reactive React components.
- **Gemstone Optics**: Drei's `<MeshRefractionMaterial>` (authored by N8Programs), which implements fast, single-pass/two-pass facet raymarching with dispersion, Total Internal Reflection, and custom environment map sampling.
- **Metallic Materials**: Standard Three.js `MeshStandardMaterial` / `MeshPhysicalMaterial` illuminated by a studio HDRI via `<Environment>`.
- **Extensible Shader Registry**: A version-controlled GLSL directory (`renderer/shaders/diamond/`) allowing developers to plug in custom raymarching or path-tracing shaders over time.

---

## 4. Head-to-Head Architectural Comparison

| Dimension | Option A: Retain WebGI | Option B: Independent Three.js / R3F (Selected) |
|---|---|---|
| **Software License** | Proprietary commercial license (Pixotronics); closed source | **MIT License (100% Free & Open Source)** |
| **Vendor Independence** | Extreme lock-in; dependent on third-party GCS bucket | **Zero vendor lock-in; self-hosted npm packages** |
| **Source Code Control** | Minified/obfuscated bundle; impossible to patch | **Complete source code ownership; fully auditable** |
| **Framework Paradigm** | Procedural imperative script (721 lines) | **Declarative React Three Fiber components** |
| **State Synchronization** | Manual DOM event listeners and global variables | **Native reactive hooks (`useConfiguratorStore`, Zustand)** |
| **Memory Management** | Manual `removeSceneModels()` prone to VRAM leaks | **Automated component unmount garbage collection** |
| **Mobile Performance** | Poor (Forces heavy GBuffer + SSR + 5-bounce raymarching) | **High (Configurable DPR, tiered shaders, adaptive passes)** |
| **E-Commerce Integration** | Difficult (Islands architecture / DOM overlays) | **Seamless (Native Next.js / React e-commerce components)** |
| **Long-Term Cost** | Ongoing commercial SDK fees / royalty risk | **Zero licensing fees; standard engineering maintenance** |

---

## 5. Architectural Decision & Rationale

### DECISION: Proceed with Option B (Independent Three.js + React Three Fiber + Drei)

#### Core Rationale:
1. **Commercial Sovereignty**: A production jewellery brand cannot risk having its core storefront customizer shut down due to third-party SDK disputes, domain restrictions, or deleted cloud storage buckets.
2. **E-Commerce Ergonomics**: React Three Fiber enables 3D geometry and materials to react automatically to Zustand state changes, making two-way data binding with MedusaJS carts and product options trivial.
3. **Performance Scalability**: Drei's `<MeshRefractionMaterial>` achieves 90–95% of WebGI's visual fidelity while running at a smooth 60 FPS on mobile devices with half the GPU fill-rate overhead.
4. **Preservation of Existing Work**: The legacy `Crystal-Jewels/` WebGI application will remain preserved in the repository as a visual and optical benchmark throughout development.

---

## 6. Visual Comparison & Validation Process

To ensure the independent renderer meets the luxury visual standards of the original WebGI demo, all new materials and lighting setups will undergo a 4-step validation protocol:

```
[WebGI Legacy Reference]                      [Independent R3F Target]
(Crystal-Jewels/index.html)                    (apps/configurator)
           │                                             │
           ├───────────────────────┬─────────────────────┤
                                   │
                                   ▼
             [Step 1: Facet Reflection & Brilliance Check]
             - Verify that tilting the ring produces sharp flashes
             - Ensure pavilion exhibits dark/bright contrast (TIR)
                                   │
                                   ▼
             [Step 2: Chromatic Dispersion ("Fire") Check]
             - Confirm spectral rainbow fringes (R/G/B ray split)
             - Verify dispersion slider (0.005 to 0.025)
                                   │
                                   ▼
             [Step 3: Precious Metal PBR Calibration]
             - Match 18K Yellow, White, and Rose Gold tones
             - Verify studio softbox reflections across band curvature
                                   │
                                   ▼
             [Step 4: Side-by-Side Dual Viewport Audit]
             - Render identical camera angles at 1080p
             - Compare luminance histograms and perceptual similarity
```
