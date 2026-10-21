const { chromium } = require('playwright-core');

async function inspectGround() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const pages = context.pages();
  let page = pages.find(p => p.url().includes('alloyum.com/demo'));
  
  const groundInfo = await page.evaluate(() => {
    const viewer = window.webGiViewers && window.webGiViewers[0];
    const items = [];
    viewer.scene.traverse((obj) => {
      if (obj.name && (obj.name.toLowerCase().includes('ground') || obj.name.toLowerCase().includes('shadow') || obj.name.toLowerCase().includes('plane'))) {
        items.push({
          name: obj.name,
          type: obj.type,
          pos: [obj.position.x, obj.position.y, obj.position.z],
          visible: obj.visible
        });
      }
    });
    return {
      items,
      sceneBg: viewer.scene.backgroundColor
    };
  });

  console.log('Ground Info:', JSON.stringify(groundInfo, null, 2));
}

inspectGround().catch(console.error);
