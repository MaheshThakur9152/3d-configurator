# 3D Jewellery Configurator

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)

**Author:** Mahesh Thakur  
**Repository:** [https://github.com/MaheshThakur9152/3d-configurator](https://github.com/MaheshThakur9152/3d-configurator)

Enterprise-grade, standalone 3D diamond jewellery configurator built with Three.js, React Three Fiber, GLSL gemstone refraction/dispersion shaders, Fastify headless pricing API, and MedusaJS e-commerce integration.

## Architecture

- **`apps/configurator`**: React Three Fiber / Drei / Three.js 3D viewer with real-time diamond dispersion & PBR metals, Zustand store, and storefront postMessage iframe bridge.
- **`services/configurator-api`**: Fastify backend with real-time Rapaport pricing engine, GLB asset validation, and MedusaJS cart adapter.
- **`packages/configurator-contracts`**: Shared TypeScript types, Zod schemas, and DTO contracts.
- **`Crystal-Jewels`**: Legacy WebGI reference implementation and visual comparison baseline.
- **`docs/`**: Comprehensive reverse-engineering and production architecture specifications.

## Quick Start

### Installation

```bash
git clone https://github.com/MaheshThakur9152/3d-configurator.git
cd 3d-configurator
npm install
```

### Development

```bash
# Run contracts build
npm run build --workspace=@configurator/contracts

# Start 3D configurator frontend
npm run dev:web

# Start headless backend API
npm run dev:api
```

### Production Build

```bash
npm run build
npm test
```

## Docker Deployment

```bash
docker compose up -d --build
```

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:4000`

## Author & License

- **Author**: Mahesh Thakur ([@MaheshThakur9152](https://github.com/MaheshThakur9152))
- **License**: MIT
