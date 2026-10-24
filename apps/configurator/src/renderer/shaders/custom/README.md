# Custom Shader Guidelines

This directory houses experimental and advanced custom shaders for the 3D jewellery configurator.

## Principles:
1. All custom shaders must be written in standard GLSL (WebGL 2.0 / Three.js compatible).
2. Shaders must never be fetched from external URLs or stored in product databases; all shaders are version-controlled and bundled with the frontend application.
3. Every new shader must implement a corresponding `MaterialFactory` in `src/renderer/materials/` and register a stable ID with `MaterialRegistry`.
