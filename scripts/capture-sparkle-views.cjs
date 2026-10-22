const { chromium } = require('playwright-core');
const path = require('path');

async function captureSparkleViews() {
  console.log('--- Capturing Diamond Sparkle Verified Views ---');

  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe',
    headless: true,
    args: ['--use-gl=angle', '--use-angle=d3d11', '--enable-webgl']
  });

  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('http://localhost:5173');
  await page.waitForTimeout(3000);

  // 1. Full ring in customer configurator
  await page.screenshot({ path: 'post-refactor-screenshots/sparkle-configurator-full.png' });
  console.log('✓ Captured full ring configurator');

  // 2. Centre stone straight-on close-up
  await page.evaluate(() => {
    const camera = window.__viewerCamera;
    const controls = window.__viewerControls;
    const renderer = window.__viewerRenderer;
    const scene = window.__viewerScene;
    if (camera && controls && renderer && scene) {
      camera.position.set(0, 3.4, 2.0);
      controls.target.set(0, 0.45, 0);
      controls.update();
      renderer.render(scene, camera);
    }
  });
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'post-refactor-screenshots/sparkle-diamond-straight-on.png' });
  console.log('✓ Captured centre stone straight-on close-up');

  // 3. Centre stone at three-quarter angle
  await page.evaluate(() => {
    const camera = window.__viewerCamera;
    const controls = window.__viewerControls;
    const renderer = window.__viewerRenderer;
    const scene = window.__viewerScene;
    if (camera && controls && renderer && scene) {
      camera.position.set(1.5, 3.0, 1.8);
      controls.target.set(0, 0.45, 0);
      controls.update();
      renderer.render(scene, camera);
    }
  });
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'post-refactor-screenshots/sparkle-diamond-three-quarter.png' });
  console.log('✓ Captured centre stone three-quarter angle');

  // 4. Centre stone during controlled orbit (angled opposite side)
  await page.evaluate(() => {
    const camera = window.__viewerCamera;
    const controls = window.__viewerControls;
    const renderer = window.__viewerRenderer;
    const scene = window.__viewerScene;
    if (camera && controls && renderer && scene) {
      camera.position.set(-1.4, 3.2, 1.9);
      controls.target.set(0, 0.45, 0);
      controls.update();
      renderer.render(scene, camera);
    }
  });
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'post-refactor-screenshots/sparkle-diamond-orbit.png' });
  console.log('✓ Captured centre stone controlled orbit');

  // 5. Pavé-shank close-up
  await page.evaluate(() => {
    const camera = window.__viewerCamera;
    const controls = window.__viewerControls;
    const renderer = window.__viewerRenderer;
    const scene = window.__viewerScene;
    if (camera && controls && renderer && scene) {
      camera.position.set(1.6, 1.8, 1.5);
      controls.target.set(0.6, 0.0, 0);
      controls.update();
      renderer.render(scene, camera);
    }
  });
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'post-refactor-screenshots/sparkle-pave-shank-closeup.png' });
  console.log('✓ Captured pavé-shank close-up');

  // 6. Model Inspector with equivalent mapping
  const inspectorBtn = await page.waitForSelector('text=Model Inspector');
  await inspectorBtn.click();
  await page.waitForTimeout(1000);

  const fileInput = await page.waitForSelector('input[type="file"]', { state: 'attached' });
  await fileInput.setInputFiles(path.resolve('docs/ring-p25696.glb'));
  await page.waitForTimeout(2500);

  const diamondNode = await page.waitForSelector('text=Diamond_Oval', { timeout: 5000 }).catch(() => null);
  if (diamondNode) {
    await diamondNode.click();
    await page.waitForTimeout(400);
    const centerGemBtn = await page.waitForSelector('button:has-text("centerGem")');
    if (centerGemBtn) await centerGemBtn.click();
  }

  const metalNode = await page.waitForSelector('text=Metal_02', { timeout: 5000 }).catch(() => null);
  if (metalNode) {
    await metalNode.click();
    await page.waitForTimeout(400);
    const metalBtn = await page.waitForSelector('button:has-text("metal")');
    if (metalBtn) await metalBtn.click();
  }

  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'post-refactor-screenshots/sparkle-inspector-matched.png' });
  console.log('✓ Captured Model Inspector with matched mapping');

  await browser.close();
  console.log('--- All Sparkle Verified Views Captured ---');
}

captureSparkleViews().catch(console.error);
