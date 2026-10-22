const { chromium } = require('playwright-core');

async function compareDiamondOptions() {
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe',
    headless: true,
    args: ['--use-gl=angle', '--use-angle=d3d11', '--enable-webgl']
  });

  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('http://localhost:5173');
  await page.waitForTimeout(3000);

  // Set close-up camera on center diamond
  await page.evaluate(() => {
    const camera = window.__viewerCamera;
    const controls = window.__viewerControls;
    const renderer = window.__viewerRenderer;
    const scene = window.__viewerScene;
    if (camera && controls && renderer && scene) {
      camera.position.set(0, 3.8, 2.2);
      controls.target.set(0, 0.45, 0);
      controls.update();
      renderer.render(scene, camera);
    }
  });
  await page.waitForTimeout(500);

  // 1. Capture current custom shader close-up
  await page.screenshot({ path: 'post-refactor-screenshots/diamond-test-current-shader.png' });
  console.log('✓ Captured current custom shader');

  // 2. Switch center stone to calibrated MeshPhysicalMaterial
  await page.evaluate(() => {
    const scene = window.__viewerScene;
    const camera = window.__viewerCamera;
    const renderer = window.__viewerRenderer;

    let centerMesh = null;
    let sideMesh = null;
    scene.traverse((c) => {
      if (c.isMesh) {
        if (c.name === 'mesh_21' || c.userData.role === 'centerGem') centerMesh = c;
        if (c.name === 'merged_sideGem') sideMesh = c;
      }
    });

    if (centerMesh && sideMesh) {
      const pbrDiamond = sideMesh.material.clone();
      pbrDiamond.name = 'PBR_Diamond_Center';
      pbrDiamond.transmission = 0.92;
      pbrDiamond.roughness = 0.0;
      pbrDiamond.metalness = 0.0;
      pbrDiamond.ior = 2.417;
      pbrDiamond.dispersion = 0.044;
      pbrDiamond.thickness = 2.5;
      pbrDiamond.reflectivity = 1.0;
      pbrDiamond.clearcoat = 1.0;
      pbrDiamond.clearcoatRoughness = 0.0;
      pbrDiamond.envMapIntensity = 3.5;
      pbrDiamond.flatShading = true;
      pbrDiamond.envMap = scene.environment;
      pbrDiamond.needsUpdate = true;

      centerMesh.material = pbrDiamond;
      renderer.render(scene, camera);
    }
  });

  await page.waitForTimeout(500);
  await page.screenshot({ path: 'post-refactor-screenshots/diamond-test-pbr-baseline.png' });
  console.log('✓ Captured PBR baseline');

  await browser.close();
}

compareDiamondOptions().catch(console.error);
