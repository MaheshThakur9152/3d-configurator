const { chromium } = require('playwright-core');

async function inspectBBox() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const pages = context.pages();
  let page = pages.find(p => p.url().includes('alloyum.com/demo'));
  
  const bboxes = await page.evaluate(() => {
    const viewer = window.webGiViewers && window.webGiViewers[0];
    const results = {};
    viewer.scene.modelRoot.traverse((obj) => {
      if (obj.name === 'HD-HHS-Oval-103dm' || obj.name === 'SH-Pave-13dm') {
        const bounds = obj.getBounds ? obj.getBounds() : null;
        results[obj.name] = {
          bounds,
          pos: [obj.position.x, obj.position.y, obj.position.z],
          rot: [obj.rotation.x, obj.rotation.y, obj.rotation.z],
          scale: [obj.scale.x, obj.scale.y, obj.scale.z]
        };
      }
    });
    return results;
  });

  console.log('BBoxes:', JSON.stringify(bboxes, null, 2));
}

inspectBBox().catch(console.error);
