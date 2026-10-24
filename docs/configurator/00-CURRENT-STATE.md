# 00 - Current State Audit and Technical Constraints

## 1. Executive Summary

This document audits the legacy **Crystal Jewels** repository (`https://github.com/VikasRana10/3D-app`, directory `Crystal-Jewels/`) to establish a baseline before migrating to a modern, in-house, production-ready 3D jewellery configurator.

The existing codebase is a single-page marketing landing page created originally by digital agency **Neotix** to showcase the commercial **WebGI** rendering framework. While visually striking, it is architecturally unsuitable for an e-commerce storefront without a complete refactoring of its rendering, state management, and asset pipelines.

---

## 2. Codebase Inventory & Technology Audit

### 2.1 File Structure & Line Counts

```text
Crystal-Jewels/
├── assets/
│   ├── ring_webgi.glb           (972,836 bytes) - Active Solitaire 3D model
│   ├── ring2_webgi.glb          (1,124,708 bytes) - Active Halo/Pavé 3D model
│   ├── ring2_webgi3.glb         (1,123,816 bytes) - Unused orphaned development duplicate
│   ├── images/                  (23 SVG/PNG UI icons & swatches)
│   ├── favicons/                (7 favicon assets & site manifest)
│   └── sounds/
│       └── music_loop.mp3       (4,207,351 bytes) - Background ambient music
├── src/
│   ├── index.ts                 (721 lines, 32.3 KB) - Monolithic procedural script
│   ├── styles.scss              (645 lines, 16.3 KB) - Landing page CSS
│   └── _variables.scss          (30 lines, 0.5 KB)   - SCSS variables
├── index.html                   (201 lines, 16.2 KB) - HTML structure with hardcoded DOM IDs
├── package.json                 (39 lines)           - Project manifest
├── package-lock.json            (14,400 lines)       - Dependency lockfile
├── tsconfig.json                (17 lines)           - Basic TypeScript config
└── Readme.md                    (33 lines)           - Minimal setup instructions
```

---

### 2.2 Dependency Tree & Runtime Versions

```json
{
  "devDependencies": {
    "@types/three": "^0.139.0",
    "@types/webgi": "https://storage.googleapis.com/dist.pixotronics.com/webgi/runtime/bundle-types-0.4.6.tgz",
    "parcel-bundler": "^1.6.1",
    "parcel-plugin-static-files-copy": "^2.6.0",
    "sass": "^1.54.0",
    "typescript": "4.4.4",
    "webgi": "https://storage.googleapis.com/dist.pixotronics.com/webgi/runtime/bundle-0.4.6.tgz"
  },
  "dependencies": {
    "gsap": "^3.10.4",
    "vercel": "^27.2.0"
  }
}
```

#### Critical Vulnerabilities & Risks:
1. **Unversioned Cloud Bucket Tarball**: The core rendering engine (`webgi`) is hosted on a single Google Cloud Storage bucket (`storage.googleapis.com/dist.pixotronics.com`). If Pixotronics removes or restricts this bucket, all fresh CI/CD builds fail instantly.
2. **Deprecated Bundler**: Parcel v1 (`parcel-bundler: ^1.6.1`) was abandoned in 2019. It lacks modern ES module code-splitting, tree-shaking, and support for modern WebAssembly/Vite tools.
3. **Outdated TypeScript**: Typescript 4.4.4 is several major versions behind modern strict typing standards.

---

## 3. Rendering Pipeline Constraints

### 3.1 Proprietary Vendor Lock-In
The current viewer delegates all rendering to WebGI's closed-source `ViewerApp`. Gemstone optics depend entirely on `DiamondPlugin` and `DiamondMaterial`. These plugins are compiled directly into the binary bundle (`bundle-0.4.6.tgz`) and cannot be audited, extended, or patched without vendor permission.

### 3.2 Fill-Rate Saturation
The rendering sequence attaches 11 simultaneous post-processing plugins:
`GBufferPlugin` $\to$ `SSAOPlugin` $\to$ `SSRPlugin` $\to$ `DiamondPlugin` $\to$ `TonemapPlugin` $\to$ `BloomPlugin` $\to$ `TemporalAAPlugin`.
This deferred multi-pass pipeline creates extreme fragment fill-rate overhead on mobile GPUs, frequently dipping below 25 FPS during camera manipulation.

### 3.3 Embedded HDRI Texture Duplication
Both `ring_webgi.glb` and `ring2_webgi.glb` embed an identical 1024x512 equirectangular studio panorama (`image 0`, taking 679 KB per file). Toggling between the two models forces the browser to download 1.36 MB of duplicate image data.

---

## 4. Architectural & E-Commerce Deficiencies

| Functional Domain | Existing Implementation | Production Storefront Requirement |
|---|---|---|
| **User Interface** | Scroll-driven marketing page with GSAP ScrollTrigger | Standalone, embeddable 3D product customizer route (`/configure/:slug`) |
| **Material Updates** | Imperative in-place mutation of `.material.color` | Declarative, typed material registry with stable IDs and parameter validation |
| **Model Swapping** | Complete scene destruction (`removeSceneModels()`) and network reload | Modular component assembly (`Shank`, `Setting`, `Prongs`, `CenterStone`) |
| **Object Resolution**| Fragile string matching (`findObjectsByName('silver')`) | Manifest-driven mapping linking product variants to geometry nodes |
| **Parametric CAD** | Completely absent (static geometry only) | Dynamic carat scaling and ring sizing via morph targets / procedural offsets |
| **Pricing Engine** | Completely absent | Server-side authoritative pricing based on daily gold spot prices and carat tiers |
| **Persistence** | Completely absent (state lost on page refresh) | URL query synchronization (`#cfg=...`) and backend saved-configuration IDs |
| **Commerce Bridge** | Completely absent | MedusaJS headless commerce integration (cart line items with custom metadata) |
| **Deployment** | Local Parcel server / manual Vercel deploy | Multi-stage Docker containers with health checks and Compose orchestration |

---

## 5. Migration Strategy

To transition from this legacy prototype to an enterprise-grade jewellery configurator:
1. **Preserve Legacy Reference**: Keep `Crystal-Jewels/` intact in the repository as a visual and optical benchmark.
2. **Adopt Monorepo Architecture**:
   - `packages/configurator-contracts`: Shared TypeScript types and Zod validation schemas.
   - `services/configurator-api`: Headless Node.js API with product manifests, dynamic pricing, and MedusaJS cart adapter.
   - `apps/configurator`: Standalone Next.js/Vite React Three Fiber configurator with declarative shaders and responsive UI.
3. **Transition Rendering**: Replace proprietary WebGI with an independent, open-source Three.js + React Three Fiber + Drei rendering architecture.
