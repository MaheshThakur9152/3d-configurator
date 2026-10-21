# Project Architecture Audit: Alloyum 3D Ring Configurator Reconstruction

**Audit Date:** 2026-10-21  
**Environment:** Windows, Brave Browser (Chromium CDP / Executable integration)  
**Target URL Reconstructed:** https://alloyum.com/demo/  

---

## 1. Actual Technology Stack

A rigorous forensic audit of `package.json`, installed `node_modules`, build configurations, and source code imports reveals the following factual technology stack:

| Technology | Status | Role in Codebase |
|---|---|---|
| **React** (`18.3.1`) | **Active Runtime** | Core component UI framework (`useState`, `useEffect`, `useRef`). |
| **React DOM** (`18.3.1`) | **Active Runtime** | Mounts the root component tree to `<div id="root">` in `index.html`. |
| **Three.js** (`^0.174.0`) | **Active Runtime** | Powers the entire 3D rendering pipeline: `Scene`, `PerspectiveCamera`, `WebGLRenderer`, `MeshPhysicalMaterial`, `OrbitControls`, `GLTFLoader`, `DRACOLoader`, `PMREMGenerator`. |
| **Lucide React** (`^1.16.0`) | **Active Runtime** | Provides SVG utility icons (chat, sliders, close, arrows). |
| **TypeScript** (`^5.7.3`) | **Active Dev** | Strict type system (`strict: true`) for configurator state, models, and component props. |
| **Vite** (`^6.1.0`) | **Active Dev/Build** | Ultra-fast ESM bundler with `@vitejs/plugin-react` (2.0s production build time). |
| **Tailwind CSS** (`^3.4.17`) | **Active Styling** | Utility-first CSS classes for layout, responsive splits, flexbox, custom scrollbars, and modal styling. |
| **PostCSS** (`^8.5.1`) & **Autoprefixer** (`^10.4.20`) | **Active Styling** | Vendor prefixing and CSS transformation pipeline. |
| **Playwright Core** (`^1.50.1`) | **Active QA** | Automated browser verification testing against live Brave browser instances. |
| **Threepipe** (`threepipe`) | **NOT INSTALLED / NOT USED** | *Zero occurrences.* The app uses standard Three.js directly. Threepipe is an external high-level viewer library used by some webgi pipelines, but is not present here. |
| **React Three Fiber** (`@react-three/fiber`) | **NOT INSTALLED / NOT USED** | *Zero occurrences.* 3D rendering is managed imperatively via a `useRef<HTMLCanvasElement>` and standard Three.js lifecycle. |
| **Drei** (`@react-three/drei`) | **NOT INSTALLED / NOT USED** | *Zero occurrences.* No R3F helpers or abstractions are installed. |

---

## 2. Existing Source Directory Structure

Before refactoring, the repository has the following layout:

```text
3d-jewelry/
├── public/
│   ├── assets/
│   │   ├── icons/            # Shape, crown, action SVGs
│   │   ├── models/           # sh_pave_1.glb, hd_oval_10.glb, et_plain_03.glb
│   │   ├── thumbnails/       # Ring band and eternity PNG thumbnails
│   │   ├── logo.png          # Alloyum logo
│   │   └── swatches/         # Metal swatches
│   └── draco/gltf/           # DRACO decoder WASM/JS binaries
│
├── src/
│   ├── components/
│   │   ├── controls/         # CaratSelector, CrownSelector, GemstoneSelector, etc.
│   │   ├── modals/           # EnquiryModal.tsx
│   │   ├── tabs/             # EngagementRingTab.tsx, EternityRingTab.tsx
│   │   ├── ConfiguratorSidebar.tsx
│   │   ├── Header.tsx
│   │   └── RingViewer.tsx    # 460-line monolithic 3D component
│   ├── data/
│   │   └── configuratorData.ts
│   ├── types/
│   │   └── configurator.ts
│   ├── utils/
│   │   └── priceCalculator.ts
│   ├── App.tsx               # Root application component
│   ├── index.css             # Tailwind base & custom scrollbar
│   ├── main.tsx              # React DOM entry point
│   └── vite-env.d.ts
│
├── comparison/               # Visual verification outputs
├── baseline-screenshots/     # Visual baseline captured before refactoring
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## 3. Main Architectural Problems Identified

1. **Monolithic 3D Viewer Component (`RingViewer.tsx`):**
   - At **460+ lines**, `RingViewer.tsx` was handling at least **seven distinct responsibilities**:
     1. WebGL canvas DOM lifecycle and resize handling.
     2. Scene, camera, renderer, and tone mapping initialization.
     3. Procedural PMREM environment map generation with plane light strips.
     4. Canvas-based contact shadow plane creation.
     5. DRACO-compressed GLTF loading and mesh tracking.
     6. Imperative PBR material generation for metals and gemstones.
     7. Render loop and OrbitControls updating.
     8. Fullscreen state toggling and gesture hints.
   - Any modification to materials or camera risked breaking the loading logic or render loop.

2. **Mixed State and Side Effects in `App.tsx`:**
   - `App.tsx` held state for tabs, options, fullscreen, inquiry modal, and loading indicators, while also managing timeout-based side effects for the loading bar.
   - Price calculation was invoked inline rather than memoized via a dedicated hook.

3. **Duplicated Selector Code and Inconsistent Data Locations:**
   - Option data lived in `src/data/configuratorData.ts`, types in `src/types/configurator.ts`, and utility logic in `src/utils/priceCalculator.ts`.
   - Feature-specific code was scattered across top-level generic folders rather than organized by domain feature (`configurator` vs `ring-viewer`).

4. **Missing Path Aliases (`@/*`):**
   - Deep relative imports (`../../types/configurator`, `../data/configuratorData`) made moving files error-prone and obscured module boundaries.

5. **The Diamond Defect:**
   - In `RingViewer.tsx`, the diamond material had `color: 0xfcfdff` (opaque white diffuse) combined with `transmission: 0.35` and `flatShading: true`.
   - This rendered the diamond as an unnatural milky white porcelain oval rather than a cut, transparent, refractive gemstone with high-index facet reflections.

---

## 4. Existing State Management & Data Flow

- **State Model:** Flat state object `ConfiguratorState` managed via React's `useState`:
  - `activeTab`: `'engagement'` | `'eternity'`
  - `selectedShank`, `selectedMetal`, `selectedShape`, `selectedCrown`
  - `selectedCenterstone`, `selectedSideDiamond`, `selectedCarat`
  - `selectedQuality`, `selectedOrigin`, `selectedRingSize`
  - `eternityActive`, `selectedEternity`
  - `isFullscreen`, `isEnquiryOpen`, `isLoading`
- **Synchronization with 3D Canvas:**
  - `RingViewer.tsx` subscribed to `state` via `useEffect`.
  - When state updated, `updateMaterials()` traversed the scene graph meshes and swapped materials or adjusted group scales.
  - While functional, mutating materials inside a `useEffect` without a dedicated abstraction made debugging difficult.

---

## 5. Refactoring Risks & Mitigation Plan

| Risk | Impact | Mitigation Strategy |
|---|---|---|
| **Breaking Three.js Canvas Context** | Canvas re-creation on render creates WebGL context leaks or black screens. | Keep canvas lifecycle inside a custom hook (`useRingViewer`), ensuring single initialization and proper cleanup. |
| **Import Path Breakages** | Compilation failures during folder reorganization. | Set up `@/` path alias in both `tsconfig.json` and `vite.config.ts`. Run `tsc && vite build` after each move. |
| **Visual Regressions on UI / Layout** | Accidental changes to sidebar width, padding, font sizes, or tabs. | Captured baseline screenshots in `baseline-screenshots/` across 5 viewports before making changes. Automated Playwright verification will confirm zero UI regression. |
| **Material Desynchronization** | Selecting a metal or gemstone fails to update the 3D model. | Encapsulate material builders in dedicated modules (`ring-materials.ts`, `gemstone-materials.ts`) with persistent mesh role tagging (`userData.role`). |

---

## 6. Baseline Verification Results

Before altering code, `capture-baseline.cjs` executed across Brave browser viewports:
- Desktop (`1440 × 900`): Saved to `baseline-screenshots/baseline-desktop-1440x900.png`.
- Laptop (`1280 × 800`): Saved to `baseline-screenshots/baseline-laptop-1280x800.png`.
- Tablet (`768 × 1024`): Saved to `baseline-screenshots/baseline-tablet-768x1024.png`.
- Mobile (`390 × 844`): Saved to `baseline-screenshots/baseline-mobile-390x844.png`.
- Narrow Mobile (`360 × 800`): Saved to `baseline-screenshots/baseline-narrow-360x800.png`.
- Interactions: Yellow Gold, Rose Gold, Add Eternity, and Enquiry Modal verified and saved.
