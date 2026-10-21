const { chromium } = require('playwright-core');

async function inspectRefGeo() {
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

  const geoData = await page.evaluate(() => {
    const viewer = window.webGiViewers && window.webGiViewers[0];
    let gemMesh = null;
    viewer.scene.modelRoot.traverse((obj) => {
      if (obj.isMesh && (obj.material?.name === 'Gem 01' || obj.name === 'mesh_21')) {
        gemMesh = obj;
      }
    });

    if (!gemMesh) return null;
    const geo = gemMesh.geometry;
    geo.computeBoundingBox();
    const box = geo.boundingBox;

    return {
      name: gemMesh.name,
      vertexCount: geo.attributes.position.count,
      indexCount: geo.index ? geo.index.count : 0,
      hasNormals: !!geo.attributes.normal,
      hasUvs: !!geo.attributes.uv,
      min: [box.min.x, box.min.y, box.min.z],
      max: [box.max.x, box.max.y, box.max.z],
      size: [box.max.x - box.min.x, box.max.y - box.min.y, box.max.z - box.min.z]
    };
  });

  console.log('Gem 01 geometry on reference:', JSON.stringify(geoData, null, 2));

  await page.close();
  if (!isCDP) await browser.close();
}

inspectRefGeo().catch(console.error);
