const { chromium } = require('playwright-core');

async function checkCamExact() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const pages = context.pages();
  let page = pages.find(p => p.url().includes('alloyum.com/demo'));

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.waitForTimeout(1000);

  const cam = await page.evaluate(() => {
    const viewer = window.webGiViewers && window.webGiViewers[0];
    const c = viewer.scene.activeCamera._camera;
    const ctrl = viewer.scene.activeCamera._controls;
    return {
      fov: c.fov,
      aspect: c.aspect,
      pos: [c.position.x, c.position.y, c.position.z],
      target: [ctrl.target.x, ctrl.target.y, ctrl.target.z],
      zoom: c.zoom
    };
  });

  console.log('Live reference camera at 1440x900:\n', JSON.stringify(cam, null, 2));
}

checkCamExact().catch(console.error);
