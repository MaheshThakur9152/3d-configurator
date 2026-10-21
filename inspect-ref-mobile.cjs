const { chromium } = require('playwright-core');

async function inspectMobile() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const pages = context.pages();
  let page = pages.find(p => p.url().includes('alloyum.com/demo'));

  await page.setViewportSize({ width: 390, height: 844 });
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
    };
  });

  console.log('Reference camera on mobile 390x844:\n', JSON.stringify(cam, null, 2));

  // Also take screenshot of reference mobile to compare
  await page.screenshot({ path: 'inspection/screenshots/ref-mobile-live.png' });
}

inspectMobile().catch(console.error);
