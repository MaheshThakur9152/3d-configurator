# Reconstruction Plan: Alloyum 3D Ring Configurator

## 1. Technical Decisions & Architecture

- **Build Tool & Framework:** Vite + React 18 + TypeScript. Fast HMR, lightweight bundle, clean component tree.
- **Styling:** Tailwind CSS v3 with custom configuration for colors, custom scrollbars, animations (`loading-bar`), and exact font families (`Red Hat Display`, `Noto Sans Thai`).
- **3D Graphics:** Three.js (`three` + `@types/three`).
  - WebGLRenderer with ACESFilmicToneMapping, sRGB output encoding, antialiasing.
  - OrbitControls with azimuthal rotation damping and polar angle clamping.
  - Physically based metallic shaders for ring band and prongs (`metalness: 1.0`, `roughness: 0.05-0.12`).
  - Diamond refraction / dispersion shader with `ior: 2.42` for the center gemstone and pave stones.
  - Soft ground contact shadow plane with blur.
  - Real-time GLB model loading for shank band, head/diamond setting, and optional eternity ring band.
- **State Model:**
  - Single centralized state hook (`useConfigurator`) handling active shank, metal, shape, crown, centerstone, side diamond, carat, quality, origin, ring size, eternity active, and eternity style.
  - Dynamic price calculation with exact baseline matching ($7,836 White Gold, $7,831 Yellow Gold, $7,833 Rose Gold, +$195 for eternity band, carat scaling).

---

## 2. Component Hierarchy

```
App
├── Header (Logo, Alloyum link, "Sign in" action)
├── main (Responsive container: 70/30 on desktop, 50/50 stacked on mobile)
│   ├── RingViewer (Three.js WebGL canvas, watermark, gesture hint, fullscreen toggle)
│   └── ConfiguratorSidebar (Title, description, price, tabs, custom scrollbar)
│       ├── TabNavigation ("Engagement Ring" | "Eternity Ring")
│       ├── [Engagement Ring Tab Content]
│       │   ├── ShankSelector (14 ring shank thumbnails with tooltips & active circle)
│       │   ├── MetalSelector (Yellow Gold, White Gold, Rose Gold swatches)
│       │   ├── ShapeSelector (5 diamond shapes: Cushion, Emerald, Oval, Pear, Round)
│       │   ├── CrownSelector (7 head settings: Halo, Hidden Halo, Secret Hidden Halo, 4 Prongs, 6 Prongs, Secret Bazel, Tulip)
│       │   ├── GemstoneSelector (Centerstone & Side Diamond 7 gemstone colors)
│       │   ├── CaratSelector (0.50 ct, 1.00 ct, 2.00 ct)
│       │   ├── QualityOriginSelector (Dropdown selects for Quality & Origin)
│       │   └── RingSizeSelector (US 4 to US 12 buttons with active underline)
│       ├── [Eternity Ring Tab Content]
│       │   ├── EternityToggle ("NO ETERNITY" | "ADD ETERNITY")
│       │   └── EternityBandSelector (11 eternity band models)
│       └── StickyCTA ("💬 INTERESTED, ENQUIRE?")
└── EnquiryModal (Dialog with backdrop blur, Full Name, Email, Phone, Rich Text Toolbar, reCAPTCHA, Submit, Cancel)
```

---

## 3. Implementation Order

1. **Phase 2 — Asset Pipeline:**
   - Run asset download script to fetch all SVGs (shapes, crowns, gemstones, carats), metal swatches, shank thumbnails, eternity thumbnails, and 3D GLB models from the verified public URLs directly into `public/assets/`.
2. **Phase 3 — Project Scaffold:**
   - Install React, React-DOM, TypeScript, Vite, Tailwind CSS, Autoprefixer, Postcss, Three.js, `@types/three`, and Lucide-react.
   - Configure Tailwind with typography and colors.
3. **Phase 4 — 3D Viewer Implementation:**
   - Build `RingViewer` Three.js canvas component with camera, lighting, shadow plane, materials, OrbitControls, watermark, and fullscreen mode.
   - Implement metal material swapping (Yellow Gold, White Gold, Rose Gold).
   - Implement gemstone color tinting (Diamond, Blue Sapphire, Ruby, Emerald, Aquamarine, Pink Diamond, Yellow Sapphire).
   - Implement stacked eternity band rendering when active.
4. **Phase 5 — Configurator UI & Layout:**
   - Build Header, Sidebar, Title, Price, Tabs, and all Option Selectors.
   - Replicate the exact typography, borders, paddings, tooltips, and active indicator bars.
   - Build Enquiry Modal with rich text editor toolbar and reCAPTCHA widget.
5. **Phase 6 — Responsive Layouts:**
   - Verify and tune for Desktop (1440 × 900), Laptop (1280 × 800), Tablet (768 × 1024), Mobile (390 × 844), and Narrow Mobile (360 × 800).
6. **Phase 7 — Verification & Comparison:**
   - Launch local dev server, connect via Brave CDP, capture screenshots matching reference viewports, perform side-by-side visual comparisons, fix discrepancies, verify all interactions, run typecheck and build.
