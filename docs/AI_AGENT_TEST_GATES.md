# AI Coding Agent Test Gates — Carpediam 3D Jewellery Configurator

**Purpose:** Prevent regressions, false claims of success, and visual fixes that only change React state without changing the 3D scene.

**Repository:** `MaheshThakur9152/3d-configurator`  
**Known inspected reference commit:** `b001e48` (the agent must inspect the current branch because it may have advanced).  
**Scope:** Three.js jewellery rendering, diamond optics, metal materials, configurator behavior, GLB inspection/upload, and performance.

---

## 1. Non-negotiable rule

For every bug fix or feature, the agent must:

1. Reproduce the problem or capture the current baseline.
2. Identify the root cause from source code and/or assets.
3. Add a test that would catch the defect before fixing it, where practical.
4. Make the smallest safe implementation change.
5. Run the relevant tests and full production build.
6. Verify the actual browser/3D scene, not only the React state or selected button.
7. Save real before/after evidence when a visual change is involved.
8. Report exactly what was run, what passed/failed, and any unverified claims.

**Never mark a task complete because the UI button highlights, a build succeeds, or a test only checks state.** The corresponding 3D visual behavior must also be verified.

Do not fabricate test outputs, screenshots, benchmark numbers, or visual similarity claims. Do not silently update a screenshot baseline just to make a failing visual test pass.

## 2. Repository safety before edits

Before editing:

- Inspect `git status`, current branch, latest commit, `package.json`, lockfile, and relevant files.
- Preserve unrelated working-tree changes. Do not reset, clean, discard, or overwrite user work.
- Identify the real current paths instead of assuming prior documentation is still accurate.
- Run the existing production build and available verification scripts.
- Record the starting errors, if any.
- Capture the current configurator screenshot at fixed viewport sizes and the model inspector with a known GLB.
- Record the exact model asset, mesh role, material, environment texture, camera framing, and renderer settings involved in the issue.

If baseline build/tests already fail, record that separately. Do not attribute existing failures to the new changes.

## 3. Required testing layers

### Layer A — Unit tests (fast, repeatable)

Test deterministic functions without relying on screenshot appearance.

Recommended test areas:

- Mesh-role classification
- Configuration-to-mesh mapping
- Material profile selection
- Asset manifest validation
- Carat/dimension conversion functions
- Variant compatibility rules
- Model metadata and capability handling
- Resource ownership/disposal helpers where testable

Inspect the installed dependencies first. At the inspected commit, `package.json` listed `playwright-core` but no `test` script and no `@playwright/test` runner. Do not assume a test runner exists. If unit tests require a runner, propose the smallest suitable addition (for example, Vitest for TypeScript modules) and configure it intentionally. Do not install packages without recording why they are needed.

### Layer B — Integration tests (real Three.js objects)

Use actual Three.js `Scene`, `Group`, `Mesh`, `BufferGeometry`, and material objects to test how configuration code changes the scene.

At minimum, verify:

- Selecting white/yellow/rose gold changes only meshes tagged as metal.
- Centre-stone material changes apply to the centre stone.
- Side-stone material remains the lighter/optimized side-stone profile and does not accidentally use a centre-stone-only shader.
- Changing metal does not modify stone material or geometry.
- Changing carat changes the intended centre stone dimensions and does not unintentionally enlarge the band or thicken prongs.
- Selecting a shape/crown/shank actually activates the compatible geometry variant, or the option is disabled/reported unsupported.
- Enabling/disabling eternity changes visibility and selecting another eternity option loads the correct asset.
- Generic mesh names do not cause unsafe automatic classification; the inspector must allow explicit role mapping.
- Geometry optimization preserves transforms, material/role assignments, required independently configurable meshes, and correct positioning.
- Switching products does not dispose shared assets that are still in use.

Do not test only that `selectedMetal` or `selectedShape` changed in React state. Assert the actual mesh material, visibility, transformation, or active geometry.

### Layer C — Browser tests

Use the repository's existing Brave/Playwright setup where possible.

Test real user flows:

1. Product viewer loads with no console errors or failed required asset requests.
2. Each metal selector updates the actual ring appearance.
3. Centre-stone and side-stone materials are independent.
4. Carat changes affect the intended mesh only.
5. Shape, crown/prongs, shank, ring size and eternity options behave honestly and correctly.
6. Upload a valid simple GLB and a valid multi-mesh GLB.
7. Upload a GLB with generic mesh names; manually assign roles and verify the preview updates.
8. Invalid/corrupt/non-GLB files show an actionable error.
9. Model switching, resize, fullscreen and repeated selection do not break the WebGL context.
10. Orbit, zoom, pan and reset controls work; page scrolling is not unnecessarily trapped by the canvas.

The model inspector must be tested independently from the customer configurator because their setup, lighting, materials and render loops may differ.

### Layer D — Visual regression tests

For visual changes, capture screenshots in a stable environment and compare at the same:

- Browser and browser version
- Viewport dimensions
- Model asset and configuration
- Camera position/target and zoom
- Device pixel ratio
- Environment maps and exposure
- Loading-complete state

Capture at least:

- Default white-gold ring
- Yellow-gold ring
- Rose-gold ring
- Centre diamond close-up
- Pavé shank close-up
- Model inspector preview
- Mobile view

Review images visually. Use pixel comparison only with a justified tolerance; rendering can vary by OS, GPU and browser. Never change expected screenshots automatically without inspecting the diff and explaining why the new output is correct.

A screenshot test alone is insufficient: pair it with assertions that the expected material/mesh/asset was actually selected.

### Layer E — Performance and lifecycle tests

Measure before and after on the same browser/device and fixed product:

- GLB download size and load time
- First useful render time
- `renderer.info.render.calls`
- `renderer.info.render.triangles`
- Frame time while rotating, when measurable
- GPU/resource counts across repeated model changes where measurable
- Idle rendering behavior
- Console warnings/errors
- Correct cleanup after unmount or asset replacement

Do not claim “60 FPS,” “zero idle GPU usage,” or “92% fewer draw calls” without real measurements and the device/browser conditions. `renderer.info` is useful but does not measure total GPU time or physical GPU utilization by itself.

Be careful with geometry merging: it can improve draw calls while destroying individual mesh selection or independent configuration. Only merge components whose future behavior permits it.

---

## 4. Mandatory regression tests for known defects

At the inspected commit `b001e48`, the agent should verify these specific risks against the current branch before changing anything.

### A. Centre stone vs. side-stone role

Relevant files include:

- `src/features/ring-viewer/lib/model-configuration.ts`
- `src/features/model-inspector/hooks/useModelInspector.ts`
- `src/features/ring-viewer/lib/gemstone-materials.ts`

Tests:

- A known centre stone such as `Diamond_Oval` is assigned `centerGem` after inspection.
- A metal mesh named `mesh_21` inside a shank must not be misclassified as a gemstone based on its name alone.
- Explicit designer role mapping takes precedence over heuristics.
- The centre stone gets the centre-stone material profile; accent stones get the side-stone profile.
- Reapplying configuration does not create unnecessary duplicate materials or leak GPU resources.

### B. Environment texture type and loading order

Relevant files include:

- `src/features/ring-viewer/lib/viewer-setup.ts`
- `src/features/ring-viewer/hooks/useRingViewer.ts`
- `src/features/diamond-shader/DiamondShaderMaterial.ts`

Tests:

- `loadStudioEnvironments()` returns clearly named, correctly typed metal and gem environment textures.
- The custom shader receives the texture representation it is written to sample. Do not pass a PMREM CubeUV texture into custom equirectangular UV sampling.
- The gem shader uses the intended gemstone environment, not an accidentally aliased metal HDR texture.
- The result is correct regardless of whether the model or environment finishes loading first.
- A failed HDR/EXR request follows a tested fallback path and does not leave the scene permanently unrendered.
- Colour-space and texture-mapping assumptions are explicitly documented and verified.

### C. Diamond shader correctness

Relevant file:

- `src/features/diamond-shader/DiamondShaderMaterial.ts`

Tests and checks:

- Shader compiles successfully on the supported WebGL context.
- Required uniforms are bound to valid textures/values.
- No shader compilation or WebGL errors are emitted.
- Sampling code matches the format of the provided environment texture.
- Reflection/refraction calculations use correct coordinate spaces and normals for supported model transforms.
- The shader produces stable highlights while the camera orbits.
- The shader does not depend on arbitrary world-space directions that create stationary artificial sparkles.
- The feature fallback to the standard gemstone material works on unsupported devices.
- The code does not claim physically exact multi-bounce ray tracing unless actual geometry intersections and optical paths are computed.

The visual acceptance criteria are distinct, readable diamond facets, controlled bright/dark contrast, convincing internal visual depth and reflections that move as the camera moves. A rainbow-colored pixel or sharply polygonal appearance alone does not count as realism.

### D. Geometry normal/optimizer safety

Relevant files may include:

- `src/features/shared-viewer/lib/GeometryOptimizer.ts`
- `src/features/ring-viewer/lib/model-loader.ts`

Tests:

- The importer preserves source geometry/normals by default unless a validated processing step is required.
- Any normal recalculation has a test asset and before/after visual comparison.
- Centre stones remain independently configurable.
- Transform baking preserves object placement.
- Mesh merging does not merge materials/roles that must remain separate.
- Geometry owned by a source mesh is disposed only if no clone or remaining object uses it.
- Optimization reports before/after mesh/draw-call counts from actual measurement rather than fixed claims.

### E. Configuration correctness

Relevant files may include:

- `src/features/ring-viewer/lib/model-configuration.ts`
- `src/features/ring-viewer/lib/model-loader.ts`
- `src/features/configurator/data/configuration-options.ts`
- `src/features/configurator/hooks/useConfigurator.ts`

Tests must make it impossible to silently claim a control works when only state changes:

- Shape: actual compatible stone geometry changes, or unavailable cuts are clearly disabled.
- Crown/prongs: active setting geometry changes, or unsupported variants are disabled.
- Shank: actual model changes, or unavailable assets are disabled.
- Carat: only the intended stone changes dimensions; compatibility is checked.
- Ring size: dimensions change through validated sizing logic, or the option is explicitly order-only/approximate.
- Eternity: selected asset changes to the correct file and aligns correctly.
- Pricing follows supported product-option rules.
- Rapid changes do not allow stale asynchronous model loads to overwrite the latest choice.

---

## 5. How the agent must work on each issue

Use this repeatable loop:

1. **Reproduce:** demonstrate the bug in the current app.
2. **Trace:** identify the UI event, state update, scene object, material/geometry operation and render trigger.
3. **Write regression test:** test the defect, ideally showing failure before the fix.
4. **Fix the root cause:** avoid unrelated refactoring.
5. **Run focused tests:** test the changed module and integration behavior.
6. **Run build/typecheck:** use the actual repository scripts.
7. **Run browser checks:** exercise the real workflow in Brave/Chromium.
8. **Capture evidence:** save screenshots, test logs and relevant measurements.
9. **Review diff:** verify only intended files changed and no test was weakened to force a pass.
10. **Report:** list test commands, pass/fail results, screenshots, known limitations and commit hash if committed.

If a test is impossible to automate, explicitly state why and give a reproducible manual verification procedure. Do not silently omit the check.

## 6. Required quality gates for each phase

### Gate 0 — Before implementation
- Clean baseline recorded, or existing dirty working-tree changes preserved.
- Failing behavior reproduced.
- Relevant asset and mesh identified.
- Exact code path traced.

### Gate 1 — Before calling a code fix complete
- Regression test exists and passes.
- Unit/integration tests pass.
- Type checking and production build pass.
- No new console errors or failed asset requests.
- At least one real browser verification is completed.

### Gate 2 — Before calling visual rendering complete
- Before/after images use the same camera, viewport, asset and environment.
- The centre diamond and pavé stones are inspected separately.
- Material changes affect only intended mesh roles.
- Facet/reflection behavior is checked while orbiting.
- Visual diff is reviewed by a human; no unsupported claim of a perfect match is made.

### Gate 3 — Before merging/pushing
- Relevant test suite passes from a clean run.
- All changed files are reviewed.
- No unrelated modifications or weakened assertions.
- New assets and environment files exist at the paths referenced by code.
- No missing textures, shader errors, leaked WebGL resources or known unhandled async races.
- Commit summary lists the verified behavior and remaining limitations.

Do not push or commit unless the user/project workflow permits it. Do not say code was pushed unless the command result confirms it.

---

## 7. Suggested test layout

Adapt to the actual repository rather than creating duplicate frameworks.

```text
tests/
├── unit/
│   ├── identify-mesh-role.test.ts
│   ├── configuration-mapping.test.ts
│   ├── asset-manifest.test.ts
│   └── sizing-rules.test.ts
├── integration/
│   ├── scene-material-updates.test.ts
│   ├── environment-texture-contract.test.ts
│   ├── geometry-optimizer.test.ts
│   └── model-switching.test.ts
├── browser/
│   ├── configurator.spec.ts
│   ├── model-inspector.spec.ts
│   ├── custom-glb-upload.spec.ts
│   └── visual-regression.spec.ts
└── fixtures/
    ├── single-mesh.glb
    ├── multi-mesh-ring.glb
    ├── generic-names.glb
    └── invalid-file.bin
```

These are proposed paths, not a claim that these tests already exist.

Keep small fixture assets checked into the repository only when the licensing permits it. Fixtures should be deterministic and small enough for repeated tests.

---

## 8. Definition of done

A task is complete only when:

- Its original defect is reproduced and explained.
- A regression test verifies the fix.
- Relevant tests and the production build pass.
- The real 3D scene changes, not just React state.
- Visual evidence exists for visual claims.
- Performance improvements are measured rather than guessed.
- Existing UI and unrelated functionality remain intact.
- Limitations are documented honestly.

If a test fails, stop and fix it. Do not delete the test, reduce its assertions, or update visual baselines without a documented, reviewed reason.

**Operating principle: every bug fix must leave the codebase more verifiable than it was before.**
