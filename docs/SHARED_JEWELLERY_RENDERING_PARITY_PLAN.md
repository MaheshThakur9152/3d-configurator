# Shared Jewellery Rendering Parity Plan
## Make the Alloyum configurator and Model Inspector render the same uploaded GLB consistently

**Repository:** `MaheshThakur9152/3d-configurator`  
**Reference commit inspected:** `b001e48` (verify the current branch before implementation)  
**Purpose:** A coding-agent implementation brief. This is not a request to create another plan; implement the fixes described here, with tests and visual verification.

---

## 1. Goal

The customer configurator and the Model Inspector must use **one shared jewellery-rendering pipeline**.

When the same GLB is displayed in both places, with the same semantic role assignments, material selections, camera angle, and render profile, its relevant 3D appearance must be consistent:

- Centre diamond uses the same centre-stone rendering profile.
- Small pavé/side diamonds use the same side-stone profile.
- Gold, white gold, rose gold, platinum, and other supported metals use the same material definitions.
- Both viewers use the same correctly typed and correctly loaded environment assets.
- Both use consistent colour management, tone mapping, exposure conventions, and lighting profile.
- Model Inspector role mapping applies the material to the actual selected mesh immediately.
- The customer configurator and Model Inspector must not silently use different gemstone shaders, environments, lighting, or role-classification rules.

The two screens may use different camera framing to suit their purpose. However, if the same model, role map, configuration, camera angle, and render profile are used, the rendered product must be visually consistent.

**Important limitation:** A generic GLB with unknown/merged mesh roles cannot be guaranteed to look like a correctly authored diamond ring automatically. The inspector must preserve imported materials for unknown parts, suggest role mappings, and allow the designer to assign roles. Once mapped, it must use the same rendering pipeline as the configurator. Do not paint every mesh with a diamond or metal material blindly.

## 2. Inspect the current branch first

Do not rely on a previous report without checking the live code.

1. Check `git status`, branch, commit SHA, and `package.json`.
2. Preserve all unrelated working-tree changes.
3. Verify the current paths and inspect the relevant files.
4. Run the existing build and test scripts before changes, documenting pre-existing failures.
5. Reproduce the visual difference using the same known GLB in both screens.
6. Capture before screenshots with identical viewport, asset, orientation, camera target, and configuration as far as possible.

At commit `b001e48`, the relevant areas included:

- `src/features/ring-viewer/lib/viewer-setup.ts`
- `src/features/ring-viewer/hooks/useRingViewer.ts`
- `src/features/ring-viewer/lib/model-loader.ts`
- `src/features/ring-viewer/lib/model-configuration.ts`
- `src/features/ring-viewer/lib/gemstone-materials.ts`
- `src/features/ring-viewer/lib/ring-materials.ts`
- `src/features/shared-viewer/lib/GeometryOptimizer.ts`
- `src/features/model-inspector/hooks/useModelInspector.ts`
- The Model Inspector components and role/manifest types

If paths have changed on the current branch, record the actual paths in the implementation report and work against those.

---

## 3. Known parity defects to verify and fix

The following were visible in the code fetched from commit `b001e48`. Verify that they still exist before editing.

### 3.1 Two different scene/lighting setups

The configurator's `setupViewer()` and Model Inspector's `useModelInspector()` create separate scenes and lighting rigs.

At the inspected commit, their settings were different:

- Configurator: ambient intensity `0.45`, key intensity `2.8`, exposure `1.25`, multiple fill/rim lights and procedural panels, then asynchronous studio HDR/EXR loading.
- Inspector: ambient intensity `2.0`, key intensity `3.5`, fill intensity `2.2`, exposure `1.35`, a separately created procedural PMREM environment.

This difference alone can make the same materials look substantially different.

**Required fix:** extract a shared renderer/scene/environment setup used by both screens. Do not maintain separate drifting copies of the same lighting/material rules.

### 3.2 Environment-map contract is inconsistent

At the inspected commit, `loadStudioEnvironments()` loaded:

- `/assets/environments/env_metal_studio.hdr`
- `/assets/environments/env_gem_sparkle.exr`

But returned `rawGemTexture: metalHdr`, which aliases the metal HDR instead of the raw gemstone EXR. The custom shader in `DiamondShaderMaterial.ts` manually maps directions to equirectangular UV coordinates. Meanwhile, the code can pass a PMREM-prefiltered environment texture to that sampler depending on loading order. PMREM CubeUV textures are not interchangeable with raw equirectangular textures sampled by custom UV calculations.

**Required fix:** use a typed, explicit environment resource contract. Never pass texture representations interchangeably.

Proposed contract, naming may adapt to the existing code:

```ts
interface JewelleryEnvironmentResources {
  metalPmrem: THREE.Texture;
  gemPmrem: THREE.Texture;
  gemEquirectangular: THREE.Texture;
}
```

The exact resources should be returned with correct types and mapping assumptions. `gemEquirectangular` must reference the intended gem source texture if—and only if—the custom shader is written to sample a raw equirectangular texture. `metalPmrem` and `gemPmrem` are for Three.js material/environment usage as appropriate.

If the custom shader is instead changed to sample PMREM correctly, implement and test that sampling path explicitly. Do not merely rename a PMREM texture to make it look like equirectangular input.

Load the shared environments once, handle failed loads with a deterministic fallback, and ensure correctness regardless of whether model loading or environment loading completes first. Dispose resources once, according to clear ownership rules.

### 3.3 Model Inspector uses a different material path

At the inspected commit, `useModelInspector.ts` constructed its own scene, ambient/direct lights and PMREM. On role assignment it passed `sceneRef.current?.environment` into `createGemstoneMaterial()`. For a centre diamond with an environment argument, that function selected the custom `DiamondShaderMaterial`, which expects the equirectangular UV contract described above. The Inspector's `scene.environment` was a PMREM-generated environment rather than that raw equirectangular source.

**Required fix:** the Inspector and Configurator must call the same shared material-profile bridge and pass the correct kind of environment resource. Do not make a local approximation of the configurator's material setup in the Inspector.

### 3.4 Role classification and mapping need one contract

The configurator uses `identifyMeshRole()` in `model-configuration.ts`, while the Inspector implements its own initial-role heuristic in `useModelInspector.ts`. These can classify a mesh differently.

For example, `Diamond_Oval` was shown in the Inspector with a `SIDEGEM` role in an earlier screenshot. A wrongly classified centre stone may receive the side-stone material profile.

**Required fix:**

- Create/use a shared semantic-role type and role-mapping implementation.
- Saved designer-assigned roles must take precedence over automatic guesses.
- Heuristics may propose an initial role but must not override an explicit assignment.
- Avoid relying on `mesh_21` alone globally; generic mesh IDs can recur in unrelated GLBs. Use product/asset context or explicit metadata, and prefer names/materials only as heuristics.
- Support roles such as `metal`, `centerGem`, `sideGem`, `setting`, `prongs`, `band`, `chain`, `clasp`, and `unassigned` where appropriate.
- Preserve original imported materials for `unassigned` meshes.
- The Inspector must visually identify the selected mesh and show its role/material assignment.
- A role change must trigger a scene render immediately.

### 3.5 The custom diamond shader needs an honest correctness review

At the inspected commit, the shader uses hard-coded approximate pavilion normals rather than tracing intersections against the stone's actual facets. This is an artistic approximation and must not be presented as true mesh-aware multi-bounce ray tracing.

**Required fix:**

1. First make the standard centre-stone rendering path consistent in both viewers.
2. Verify correct geometry, facet normals, environment texture representation and camera framing.
3. Test a standard `MeshPhysicalMaterial` baseline under the corrected environment.
4. Evaluate the custom shader separately with a controlled before/after comparison.
5. Keep it only if it demonstrably improves the appearance and passes shader, interaction and performance tests.
6. If retained, document which optical effects are approximations; don't claim exact physical ray tracing unless actual facet intersections/light paths are computed.
7. Provide a tested fallback for shader compilation or device support failure.

Do not copy proprietary shader code. Do not address every visual issue by raising transmission, environment intensity, or arbitrary colour multipliers.

### 3.6 Geometry optimization must not break inspector semantics

The configurator's loader currently runs `optimizeSceneGeometry()`, while uploaded Inspector models are traversed and displayed before equivalent optimization. The optimizer merges eligible meshes by semantic role and recalculates centre-stone normals.

**Required fix:**

- The Inspector editing/role-mapping view must preserve individually selectable source meshes.
- Runtime optimization may happen only after role assignments/configuration semantics are known, or through a non-destructive derived representation.
- Do not merge meshes that require independent role mapping, geometry switching, highlighting, stone replacement or independent transforms.
- Compare imported normals against recalculated normals before changing them.
- Keep the original upload unchanged; runtime optimizations must not mutate the source GLB.
- Geometry optimization must preserve transforms and visual results, and shared/cloned resource ownership must be clear.

---

## 4. Required architecture: one shared rendering foundation

Use the current feature-oriented structure where practical. Do not perform a broad unrelated rewrite.

Create or refactor shared modules along these lines:

```text
src/features/shared-viewer/
├── components/
│   └── JewelleryCanvas.tsx            # Optional reusable canvas host
├── hooks/
│   └── useJewelleryScene.ts            # Common lifecycle; or adapt existing hooks
├── lib/
│   ├── createJewelleryScene.ts         # Scene, renderer, camera, base controls
│   ├── createJewelleryEnvironment.ts   # Typed shared env loading/cache/disposal
│   ├── materialProfileBridge.ts        # Common role -> material assignment
│   ├── identifyMeshRole.ts             # Shared conservative role detection
│   ├── cameraFraming.ts                # Shared framing logic
│   ├── loadGlb.ts                      # Common loader/decoder config
│   └── renderScheduler.ts              # Shared on-demand render requests
└── types/
    └── jewelleryViewer.types.ts        # Shared roles, config and resource types
```

These are proposed responsibilities, not a mandate to create duplicate modules if equivalent abstractions already exist. Refactor existing modules rather than keeping two competing implementations.

The Configurator and Inspector should become thin consumers of shared rendering services:

```text
Configurator ──┐
               ├── Shared viewer scene + shared environments + shared materials
Model Inspector┘
```

Both should use the same:

- Three.js version and renderer conventions.
- Environment loading and texture-type contract.
- Tone mapping and output color space.
- Material profile factories.
- Role registry and material bridge.
- Gem/metal configuration behavior.
- Error/fallback handling.
- Resource lifecycle and render scheduling.

Differences that are allowed:
- Camera auto-framing for a different product's dimensions.
- Inspector mesh highlighting.
- Inspector edit controls and configuration side panels.
- A documented product-specific render override when needed.

Any override must be explicit product metadata, not a hidden discrepancy between two viewer implementations.

---

## 5. Model Inspector upload and role mapping behavior

For a designer-uploaded GLB, implement the following behavior:

1. Load the file into a generic viewer and show the original embedded glTF materials first.
2. Build the mesh hierarchy and display each mesh's name, triangle count and material name.
3. Let the designer select/highlight a mesh in the tree and, where feasible, by clicking the 3D model.
4. Let the designer assign semantic roles.
5. Immediately apply the same role-aware material profile used in the Configurator.
6. Let the designer switch metal previews and verify that only meshes assigned as metal change.
7. Let the designer test the centre-stone and side-stone profiles independently.
8. Save/export a manifest with stable mesh identification, roles, supported options and asset version.
9. On reloading that manifest, restore the same assignments and the same render profile.
10. Clearly label unsupported configuration capabilities rather than offering buttons that cannot change geometry.

Use stable IDs/paths in the manifest; don't rely on ephemeral runtime UUIDs as the sole persistent mesh identifiers. Where a GLB has duplicate mesh names, use a stable hierarchy path or another deterministic mesh identifier and flag ambiguous mappings.

If a GLB has one merged mesh combining metal and diamond surfaces, do not pretend role assignment can separate it. Preserve its original material and explain that the designer must re-export separated geometry or provide a suitable source asset.

---

## 6. Acceptance tests: same asset must look consistent in both screens

Create tests and manual/visual checks for each item below.

### A. Shared profile and environment tests

- Both Configurator and Inspector use the same environment-loading service.
- Both call the same `createMetalMaterial()` and gemstone material-profile code (or a single new central replacement).
- The centre-stone shader never receives a PMREM CubeUV texture through a sampler designed for raw equirectangular UV coordinates.
- The intended gem environment and metal environment cannot be accidentally swapped or aliased.
- Model-load-first and environment-load-first completion orders produce the same final material assignment/render setup.
- Failed environment loading yields a usable, clearly logged fallback.
- Both renderers use the same output color space and tone-mapping policy.

### B. Role/material integration tests

Use deterministic Three.js test objects and a small multi-mesh GLB fixture.

- Explicit `centerGem` mapping applies the centre-gem profile.
- Explicit `sideGem` mapping applies the side-gem profile.
- Explicit `metal` mapping applies the metal profile.
- Unknown/unassigned roles retain the imported material.
- Changing a metal selection does not change gemstones.
- Changing the centre gemstone does not change side stones.
- Assigning a role in the Inspector visibly changes the actual preview mesh, not only the UI badge.
- Role mappings persist and are restored from the exported/imported manifest.

### C. Custom GLB preview tests

Use at least these fixtures:

1. A valid one-mesh model with embedded material.
2. A valid multi-mesh ring with metal, centre stone, prongs and side stones separated.
3. A multi-mesh model with generic names such as `Object_1`, `Object_2`.
4. An asset with a missing/unsupported role.
5. An invalid or corrupt GLB.

Expected results:

- All valid models can be previewed even if roles are unknown.
- Unknown roles preserve original materials.
- Explicit role mapping makes the relevant shared profile available.
- Invalid files show helpful errors and do not leave the viewer in a broken state.

### D. Visual parity matrix

Capture, at fixed viewport and configuration:

1. Configurator with the default supplied ring.
2. Inspector loading the same ring GLB and using equivalent role mappings.
3. Centre-stone close-up in both viewers.
4. Pavé close-up in both viewers.
5. White gold, yellow gold and rose gold in both viewers.
6. One custom uploaded multi-mesh GLB after mapping roles.
7. The same custom asset after reload from its saved manifest.

For an exact parity comparison, set the same camera pose, field of view, environment, exposure, material profile, background and configuration. Camera auto-fit may be used normally, but for parity tests provide a shared fixed camera preset or copy the camera pose from one viewer to the other.

Use screenshot diffs as evidence, but review them visually. Do not update expected screenshots automatically merely to turn a test green. Preserve existing UI styling and compare the product rendering separately from the surrounding inspector/configurator UI.

### E. Lifecycle/performance tests

- Switch between Configurator and Inspector without accumulating WebGL contexts.
- Upload multiple models sequentially without unbounded GPU resource growth.
- Ensure textures, PMREM render targets and materials are disposed exactly once according to ownership.
- Ensure stale asynchronous loads cannot replace a more recently selected/uploaded asset.
- Confirm model reloads restore roles and materials.
- Check that on-demand rendering is requested after a role, material, environment, or configuration change.
- Record measured `renderer.info.render.calls`, triangles, download size and timings before and after optimization. Do not claim real GPU utilization solely from `renderer.info`.

---

## 7. Definition of done

This work is complete only when all of the following are true:

- [ ] Both viewers use the same shared rendering foundation and material-profile bridge.
- [ ] Environment texture types and mappings are explicit, correct and tested.
- [ ] The centre-stone role is correct for the default ring and for explicitly mapped uploads.
- [ ] Inspector material previews apply to actual selected meshes immediately.
- [ ] Same GLB + same mapping + same camera/render settings produces visually consistent product rendering in both views.
- [ ] An unassigned valid GLB still previews, with original materials preserved.
- [ ] A custom multi-mesh GLB can be mapped, previewed and reloaded from its manifest.
- [ ] The shader's capabilities and approximations are documented truthfully.
- [ ] Existing metal/configurator behavior and UI layout have no regressions.
- [ ] Unit/integration tests, production build and browser tests pass.
- [ ] Before/after screenshots are saved and reviewed.
- [ ] Performance metrics are measured; no unverified FPS/draw-call claims are made.

If an acceptance item fails, do not declare completion. Report the failure and the remaining work.

## 8. Required agent report

At the end, report:

1. Actual current branch and commit.
2. Root causes verified in the current code.
3. Files changed and why.
4. Tests added and the exact commands run.
5. Build/typecheck/browser-test results.
6. Before/after screenshot paths.
7. Measured performance values with hardware/browser/viewport context.
8. Remaining limitations, especially models that need designer re-export or explicit role mapping.

**Main principle:** One shared rendering system must power both the customer Configurator and the Model Inspector. Fix parity at its source—shared environments, role mapping, material creation and scene setup—not by tuning the two viewers independently.
