const { chromium } = require('playwright-core');

async function inspectAllMeshes() {
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
  let page = context.pages().find(p => p.url().includes('alloyum.com/demo'));
  if (!page) {
    page = await context.newPage();
    await page.goto('https://alloyum.com/demo/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
  }

  const list = await page.evaluate(() => {
    const viewer = window.webGiViewers && window.webGiViewers[0];
    const results = [];
    viewer.scene.modelRoot.traverse((obj) => {
      if (obj.isMesh && obj.parent?.name?.includes('HD')) {
        const geo = obj.geometry;
        geo.computeBoundingBox();
        const b = geo.boundingBox;
        results.push({
          name: obj.name,
          mat: obj.material ? obj.material.name : 'no-mat',
          size: [
            Math.round((b.max.x - b.min.x) * 100) / 100,
            Math.round((b.max.y - b.min.y) * 100) / 100,
            Math.round((b.max.z - b.min.z) * 100) / 100,
          ],
          center: [
            Math.round(((b.min.x + b.max.x) / 2) * 100) / 100,
            Math.round(((b.min.y + b.max.y) / 2) * 100) / 100,
            Math.round(((b.min.z + b.max.z) / 2) * 100) / 100,
          ]
        });
      }
    });
    return results;
  });

  console.log('All head meshes:\n', JSON.stringify(list, null, 2));

  await page.close();
  if (!isCDP) await browser.close();
}

inspectAllMeshes().catch(console.error);
