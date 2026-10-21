# Carpediam 3D Ring Configurator

A high-fidelity 3D jewelry ring configurator built with **React 18**, **TypeScript**, **Vite**, **Tailwind CSS**, and **Three.js**.

---

## Features

- **Interactive 3D WebGL Viewer:**
  - Real-time physical rendering of precious metals (18k White Gold, 18k Yellow Gold, 18k Rose Gold, Platinum 950).
  - High-brilliance diamond and colored gemstone shaders with optical transmission ($92\%$), refractive index ($2.417$), chromatic dispersion fire, volumetric light depth, and CAD facet vertex normal preservation.
  - Studio PMREM lighting environment with high-contrast softboxes and specular accent spots for realistic diamond scintillation.
  - Smooth damped orbit, pan, pitch limits, and soft contact shadow.
- **Customizable Jewelry Configurations:**
  - **Shank Bands:** Multiple shank profiles with and without accent pavé stones.
  - **Precious Metals:** White Gold, Yellow Gold, Rose Gold, Platinum.
  - **Diamond Cuts & Shapes:** Oval, Round, Cushion, Pear, Emerald, Radiant, etc.
  - **Crowns / Heads:** Secret Hidden Halo, Solitaire, Cathedral, and vintage prongs.
  - **Gemstones:** Diamond, Blue Sapphire, Ruby, Emerald, Aquamarine, Morganite, Moissanite.
  - **Carat Scaling:** Live 3D scaling for 0.50 ct, 1.00 ct, 1.50 ct, 2.00 ct, and 3.00 ct.
  - **Quality & Origin:** Natural vs. Lab-Grown, Good vs. Ideal cut factors.
  - **Stackable Eternity Band:** Add/remove eternity ring with real-time CAD model integration.
  - **Ring Size:** US 4 to US 12.
- **Dynamic Pricing Engine:** Instant recalculation based on metal deltas, carat curves, cut quality multipliers, origin, and stacked bands.
- **Responsive Layout:**
  - Split 70% viewer / 30% control panel on Desktop ($1440 \times 900$) and Laptop ($1280 \times 800$).
  - Vertically stacked 50% / 50% on Tablet ($768 \times 1024$) and Mobile ($390 \times 844$).
  - Fullscreen immersive mode toggle.
- **Lead Generation Modal:** Inquiry form with name, email, phone, custom notes, and mock reCAPTCHA.

---

## Tech Stack

| Technology | Purpose |
| :--- | :--- |
| **React 18** | UI component architecture and declarative state |
| **TypeScript** | Static typing across configurations and 3D scenes |
| **Vite** | Build tooling and development server |
| **Tailwind CSS** | Responsive styling and custom typography |
| **Three.js (`three`)** | WebGL scene graph, camera, lighting, and PBR materials |
| **OrbitControls** | Camera control and damping |
| **GLTFLoader & DRACOLoader** | Loading and decoding compressed 3D GLB assets |

---

## Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

### Installation
```bash
# Clone the repository
git clone https://github.com/MaheshThakur9152/3d-configurator.git

# Navigate into the project directory
cd 3d-configurator

# Install dependencies
npm install
```

### Running Locally
```bash
# Start the Vite development server
npm run dev
```
Open `http://localhost:5173` in your browser.

### Building for Production
```bash
# Run typechecking and generate production build
npm run build

# Preview the production build locally
npm run preview
```

---

## Project Structure

```text
src/
├── app/
│   └── App.tsx                    # Root composition & layout
├── components/
│   └── layout/
│       ├── Header.tsx             # Brand header & navigation
│       └── MainLayout.tsx         # Responsive layout container
├── features/
│   ├── configurator/              # Configurator feature module
│   │   ├── components/            # Selectors (Metal, Shank, Carat, etc.)
│   │   ├── data/                  # Configuration catalog
│   │   ├── hooks/                 # useConfigurator hook
│   │   ├── lib/                   # Pricing engine
│   │   └── types/                 # TypeScript interfaces
│   └── ring-viewer/               # 3D Ring Viewer feature module
│       ├── components/            # WebGL Canvas component
│       ├── hooks/                 # useRingViewer Three.js lifecycle hook
│       ├── lib/                   # Viewer setup, materials, model loader
│       └── types/                 # Viewer & scene types
└── styles/
    └── index.css                  # Tailwind styles & scrollbars
```

---

## Documentation

Comprehensive architecture guides are available in the [`docs/`](docs/) directory:
- [`docs/TECH_STACK_AND_CODEBASE_GUIDE.md`](docs/TECH_STACK_AND_CODEBASE_GUIDE.md): Technology stack, custom hooks, and practical developer modification recipes.
- [`docs/COMPONENT_ARCHITECTURE.md`](docs/COMPONENT_ARCHITECTURE.md): Component hierarchy, props specifications, and event flow.
- [`docs/3D_RENDERING_AND_DIAMOND_GUIDE.md`](docs/3D_RENDERING_AND_DIAMOND_GUIDE.md): Three.js WebGL pipeline, diamond physics, and gemstone formulas.
- [`docs/PROJECT_ARCHITECTURE_AUDIT.md`](docs/PROJECT_ARCHITECTURE_AUDIT.md): Architectural analysis and baseline benchmarks.

---

## License

MIT
