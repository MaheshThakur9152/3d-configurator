const { chromium } = require('playwright-core');

async function captureCloseups() {
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe',
    headless: true,
    args: ['--use-gl=angle', '--use-angle=d3d11', '--enable-webgl']
  });

  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('http://localhost:5173');
  await page.waitForTimeout(3000);

  // Zoom into center stone in Configurator by manipulating camera position
  await page.evaluate(() => {
    const camera = window.__viewerCamera;
    const controls = window.__viewerControls;
    const renderer = window.__viewerRenderer;
    const scene = window.__viewerScene;
    if (camera && controls && renderer && scene) {
      // Close-up framing focused on center diamond
      camera.position.set(0, 3.8, 2.2);
      controls.target.set(0, 0.45, 0);
      controls.update();
      renderer.render(scene, camera);
    }
  });

  await page.waitForTimeout(500);
  await page.screenshot({ path: 'post-refactor-screenshots/parity-configurator-diamond-closeup.png' });
  console.log('✓ Captured configurator diamond close-up');

  await browser.close();
}

captureCloseups().catch(console.error);
