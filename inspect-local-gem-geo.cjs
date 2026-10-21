const { chromium } = require('playwright-core');

async function inspectGeo() {
  let browser;
  let isCDP = false;
  try {
    browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
    isCDP = true;
  } catch (err) {
    browser = await chromium.launch({
      executablePath: 'C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe',
      headless: true,
    });
  }

  const context = isCDP ? browser.contexts()[0] : await browser.newContext();
  let page = await context.newPage();
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);

  const geoInfo = await page.evaluate(() => {
    // Find canvas and access scene via three internal or traverse window
    // We can inspect the headMeshGroup or objects in scene
    // In RingViewer, let's see if we can find the mesh
    const canvas = document.querySelector('canvas');
    return {
      canvasWidth: canvas.width,
      canvasHeight: canvas.height,
    };
  });

  console.log('Geo info:', geoInfo);

  await page.close();
  if (!isCDP) await browser.close();
}

inspectGeo().catch(console.error);
