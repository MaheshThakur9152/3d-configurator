# Focused Diamond Sparkle Fix — Preserve the Current Working Configurator

**Repository:** `MaheshThakur9152/3d-configurator`  
**Latest source inspected for this brief:** `dcdf3343dfdae1ca867c1f46bd1e4ebcc03f867c`  
**Goal:** Improve centre-diamond brilliance, facet contrast and moving scintillation without regressing the current metal appearance, configurator UI, model-inspector parity or performance.

## 0. Scope: do not restart the project

The customer configurator, shared viewer architecture and much of the metal/configuration work now look substantially better. The remaining visible gap is the centre diamond: it has large grey/white polygons but not the lively bright/dark facet flashes of the reference.

This is a **focused rendering task**, not a new architectural rewrite.

- Preserve the current UI, layout, controls, metal profiles, asset upload flow and shared-viewer structure.
- Do not migrate to Threepipe or another engine for this task.
- Do not randomly modify many material values.
- Do not introduce animated fake glitter or screen-space sparkles as a substitute for correct diamond appearance.
- Do not promise an exact commercial-reference match without matched-asset visual evidence.
- Inspect the current branch before edits; the commit listed above is the source snapshot used to create this brief.

## 1. Current-code findings to verify

Inspect these files first:

- `src/features/diamond-shader/DiamondShaderMaterial.ts`
- `src/features/ring-viewer/lib/gemstone-materials.ts`
- `src/features/shared-viewer/lib/createJewelleryEnvironment.ts`
- `src/features/shared-viewer/lib/materialProfileBridge.ts`
- `src/features/shared-viewer/lib/createJewelleryScene.ts`
- `src/features/shared-viewer/lib/GeometryOptimizer.ts`
- `src/features/ring-viewer/lib/model-loader.ts`
- `src/features/configurator/data/configuration-options.ts`
- Existing shader/environment/configuration tests.

The following issues were present in the inspected source. Confirm whether each remains before changing it.

### A. The optical shader is a heuristic, not mesh-aware multi-bounce ray tracing

`DiamondShaderMaterial.ts` selects among hard-coded pavilion-normal vectors such as:

```glsl
vec3 pavN1 = normalize(vec3(0.68, -0.73, 0.0));
vec3 pavN2 = normalize(vec3(-0.68, -0.73, 0.0));
vec3 pavN3 = normalize(vec3(0.0, -0.73, 0.68));
vec3 pavN4 = normalize(vec3(0.0, -0.73, -0.68));
```

It chooses an idealized direction based on the refracted ray's quadrant, then applies reflection calculations against those assumed directions. It does not intersect the ray with the diamond's actual pavilion facets.

This may create angular contrast, but it is not actual geometry-aware ray tracing. Do not describe it as physically exact multi-bounce TIR.

The shader also uses a fixed-direction glint:

```glsl
float glint = pow(
  clamp(dot(reflectDir, vec3(0.5, 0.8, -0.3)), 0.0, 1.0),
  32.0
);
```

That glint does not come from the actual environment-light distribution. It can create an artificial highlight that does not correspond to a real reflected softbox or point source.

The `facetExtinction` uniform is declared and provided but was not used in the fragment shader at the inspected commit. Check whether it is still unused. Remove dead controls or implement their documented purpose; do not leave misleading uniforms.

### B. Custom shader lighting is not the same as scene lighting

The custom `ShaderMaterial` explicitly samples its environment texture. Adding a `DirectionalLight` to the Three.js scene does not automatically make that light contribute to this custom shader the way it contributes to `MeshPhysicalMaterial`.

Therefore, the centre stone's highlight pattern primarily depends on the environment texture and the custom shader calculations. Do not keep adding scene lights while assuming the custom shader receives the same direct-light shading automatically.

### C. Environment fallback type can be wrong

In `createJewelleryEnvironment.ts`, the successful path distinguishes:
- `metalPmrem`
- `gemPmrem`
- `gemEquirectangular`

The custom diamond shader manually converts direction vectors into equirectangular UV coordinates and samples the texture with `texture2D()`.

However, in the fallback path at the inspected commit, `gemEquirectangular` was populated with `fallbackTexture`, which is created by `pmremGenerator.fromScene(...)`. That is a PMREM/CubeUV environment texture, not a raw equirectangular texture.

The custom shader must never sample the PMREM texture as though it were equirectangular.

Required behavior:
- If the raw gem equirectangular EXR is available, pass that exact texture to the custom equirectangular sampler.
- If the raw equirectangular source fails to load, use a tested PBR fallback with an appropriate PMREM texture, or create an actual raw equirectangular fallback for the custom shader.
- Represent the texture kind explicitly in types and runtime checks where practical.
- Test both successful and failed environment loading. The code must not behave differently based on which asynchronous request completes first.

Also verify that the environment is actually loaded in the deployed application: check Network responses for both environment assets and check Console for decode, shader compilation or WebGL errors.

### D. Facet normals and geometry may limit the result

The current optimizer converts the centre-stone geometry to non-indexed geometry and recalculates vertex normals.

That may be correct for a mesh where each triangle is intended to be a planar facet, but it should not be assumed correct for every designer-exported gemstone.

Inspect the actual centre-stone GLB and establish:
- Its triangle/facet topology
- Original normals
- Dimensions and orientation
- Whether there are duplicated/overlapping surfaces
- Whether facet boundaries match a proper oval brilliant cut
- Whether optimizer changes modify the original intended facet appearance

Do not make broad geometry changes without an A/B comparison. If the current GLB has insufficient or incorrect facet geometry, a shader cannot create genuine missing facet boundaries. Record the need for a better designer-supplied cut mesh rather than trying to solve bad geometry with more shader multipliers.

## 2. Diagnose before tuning: create a controlled baseline

Before modifying code:

1. Check `git status`, branch, current commit, and preserve all uncommitted changes.
2. Run current tests and `npm run build`; record pre-existing failures.
3. Use the same centre-stone asset, current metal, same camera pose, same model scale, same environment, same viewport and same exposure in each comparison.
4. Capture a clean close-up of the centre stone and a separate close-up of pavé stones.
5. Capture the same views while slowly orbiting the camera.
6. Record whether both HDR/EXR assets return HTTP 200 and whether shader errors appear in Console.
7. Record the geometry's original and post-optimization normals/facet counts.

Do not compare two renders as if they were equivalent when their camera, stone cut, metal, lighting, or viewport differs. The Alloyum reference is the visual target, but any screenshot comparison must document differences in camera pose and asset geometry.

## 3. Separate the causes of weak sparkle

The agent must test these causes separately rather than changing all of them at once.

### Test A — Environment contribution

Render the centre stone with:
1. Original geometry + standard Three.js material under a controlled environment.
2. Original geometry + current custom shader with the actual raw gem EXR.
3. Original geometry + custom shader using a controlled test equirectangular environment with obvious bright and dark light sources.

The test environment should contain broad studio panels for the metal and a few smaller, bright, localized panels suitable for producing visibly changing diamond highlights. It must have correct texture orientation, mapping, and linear/HDR handling.

This isolates whether weak sparkle is caused by environment content/format, geometry, or the shader.

Avoid replacing the entire studio environment unless tests show it is the cause. Ensure any environment edit does not regress the polished metal.

### Test B — Geometry and normals

Render the exact same geometry/material/environment pair:
- With source normals preserved
- With the current optimizer's per-triangle normal recalculation

Keep camera, exposure, background, and environment unchanged. Compare the images and rotate both models. Preserve the normal strategy that best represents the actual CAD facets, rather than choosing the version that simply produces the most polygons or most angular appearance.

If a designer must provide a higher-quality faceted mesh, document that clearly.

### Test C — Shader behavior

Test whether reflections move in response to camera orbit in a way consistent with the environment.

The goal is:
- High-contrast but controlled bright/dark facet regions
- Sharp reflections that respond to camera movement
- Visible internal depth instead of a flat grey faceted shell
- Subtle, physically plausible dispersion where supported
- No arbitrary fixed-direction sparkle that appears unrelated to the environment
- No uniform white wash or excessive black patches

A sharply polygonal image is not, by itself, a successful diamond render.

### Test D — Standard material vs specialized shader

Use the corrected geometry and same environment to compare:
- `MeshPhysicalMaterial` baseline
- Current custom shader after correcting its environment contract
- A revised custom shader only if evidence supports more work

Pick based on actual screenshot/interaction quality and measured performance. If the current custom shader remains less convincing than the PBR baseline, don't keep it just because it is more complicated.

Do not copy proprietary shader code. Clearly identify any approximations in a custom implementation. If implementing true ray/facet intersections exceeds the current task, state that instead of labelling an approximate effect as physically exact.

## 4. Centre stone and side stones need separate quality profiles

Use the centre stone for the highest-quality optics, because it is the most visually important and occupies the largest screen area.

Small pavé stones should use a more economical, validated profile. They need to remain visually distinct and bright enough to read as individual diamonds, but do not need the same expensive optical calculation as the centre stone.

Do not make the pavé material near-black merely to remove a white haze. Tune its tint, reflection contribution, transmission and geometry together against the reference.

Do not alter metal material profiles while tuning the centre stone unless a controlled test demonstrates a dependency. Record any metal regression and fix it before completion.

## 5. Required implementation scope

Make only the changes justified by the findings. Likely touch points include:

- `DiamondShaderMaterial.ts`: correct environment sampling contract and replace or revise unphysical fixed-direction glints / unused shader parameters.
- `createJewelleryEnvironment.ts`: keep raw equirectangular and PMREM resources separate in success and fallback paths.
- `gemstone-materials.ts`: select the centre-stone vs side-stone profile correctly, and provide a safe fallback if the custom rendering path is unavailable.
- `GeometryOptimizer.ts` or model loading: change normal processing only if the A/B test demonstrates it is required.
- `materialProfileBridge.ts`: preserve role mapping and material consistency across configurator and inspector.
- Tests: extend the existing test suite for shader/environment contracts and rendering configuration.

Do not duplicate shader or environment logic between Configurator and Model Inspector. Both must continue using the shared material profile and environment services.

## 6. Required automated tests

Write/update tests as part of the change, not afterwards.

### Environment contract tests
- Successful loads return `gemEquirectangular` as the actual raw gem equirectangular texture.
- `metalPmrem` and `gemPmrem` remain distinct from the raw equirectangular source.
- The fallback path never passes a PMREM/CubeUV texture to the equirectangular sampler.
- Load failures have a deterministic tested fallback.
- Model-first and environment-first loading complete with the same final material assignment.

### Role/material tests
- Centre stone receives the centre-stone rendering profile.
- Pavé stones receive the side-stone profile.
- Metal meshes are unchanged by diamond-only tuning.
- Unknown/unassigned meshes preserve their original material.

### Shader/runtime checks
- Shader compiles on the target WebGL context.
- No shader compilation, texture format, WebGL or console errors occur.
- Environment uniforms are populated with valid resources.
- Camera orbit triggers renders, and reflections/highlights update.
- Unsupported/error paths fall back without a broken or black viewer.
- No new resource leaks occur after repeated configuration changes.

If a shader failure cannot be tested in a pure unit test, cover it in a real-browser test and document the limitation.

## 7. Required visual regression tests

Use the same model asset and fixed camera/viewport settings for before/after comparisons.

Capture at minimum:
1. Centre-stone straight-on close-up
2. Centre-stone at a three-quarter angle
3. Centre-stone during a small controlled orbit
4. Pavé-shank close-up
5. Full ring in the customer configurator
6. Same uploaded GLB in Model Inspector with equivalent role mapping

Use fixed camera poses for the parity test so differences are not caused by auto-framing. Also test the normal camera interaction separately.

Review each capture manually. Pixel diffs can help track regressions but cannot prove physical realism on their own. Do not rewrite screenshot baselines merely to turn tests green.

### Visual pass criteria
- Centre-stone facets have distinct, high-contrast light and dark regions.
- Specular highlights respond to camera rotation and environment direction.
- The result is not a uniformly pale grey stone, an opaque polygon shell, or generic clear glass.
- Side stones remain distinct and do not collapse into a flat white/black strip.
- Metal appearance remains at least as good as the baseline.
- Configurator and Inspector produce consistent rendering when all rendering inputs are identical.
- The result remains stable across repeated option changes.

If the visual pass criteria cannot be met because the supplied geometry is inadequate, identify the missing asset requirement and do not report the issue as fixed.

## 8. Performance checks

Measure on a named browser/device and fixed viewport:

- Model/texture load success and time
- First stable render time
- `renderer.info.render.calls`
- `renderer.info.render.triangles`
- Time/smoothness during controlled orbit, where measurable
- Behavior while idle
- Console warnings/errors
- Repeated model/configuration switching

Do not claim GPU time or physical GPU utilization from `renderer.info` alone. Do not assert a target such as 60 FPS on every phone without measuring on representative devices.

Prefer the minimum shader cost that achieves the target visual quality. Avoid per-frame allocations and avoid rebuilding the centre-stone shader material on every small state update. Dispose or reuse materials according to explicit ownership rules.

## 9. Final report required from agent

At completion report:

1. Current branch and commit.
2. Root causes actually verified.
3. Files changed and why.
4. Tests added, exact commands and results.
5. Shader compile/runtime results.
6. Before/after screenshot paths for every required view.
7. Whether the stock PBR or custom shader performed better under the controlled comparison.
8. Measured performance details and test device/browser.
9. Remaining visual limitations, including any missing/better geometry required from a designer.

**Definition of done:** the centre diamond's highlights and facet contrast visibly respond to the environment and camera, both viewers use the same rendering profile, there are no new console/shader errors, metals and configuration still work, and the improvement is demonstrated by matched before/after images and passing tests.
