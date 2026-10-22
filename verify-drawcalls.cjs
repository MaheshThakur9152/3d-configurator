const { chromium } = require('playwright-core');

async function checkDrawCalls() {
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
  const page = await context.newPage();

  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3500);

  const stats = await page.evaluate(() => {
    const r = window.__viewerRenderer;
    if (!r) return null;
    return {
      calls: r.info.render.calls,
      triangles: r.info.render.triangles,
      geometries: r.info.memory.geometries,
      textures: r.info.memory.textures,
    };
  });

  console.log('Renderer Info Stats:', stats);

  await page.close();
  if (!isCDP) await browser.close();
}

checkDrawCalls().catch(console.error);
