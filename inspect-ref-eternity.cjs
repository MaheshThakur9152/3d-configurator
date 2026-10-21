const { chromium } = require('playwright-core');

async function testRefEternity() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const pages = context.pages();
  let page = pages.find(p => p.url().includes('alloyum.com/demo'));

  await page.click('button:has-text("Eternity Ring")');
  await page.waitForTimeout(500);
  await page.click('button:has-text("ADD ETERNITY")');
  await page.waitForTimeout(2000);

  const hierarchy = await page.evaluate(() => {
    const viewer = window.webGiViewers && window.webGiViewers[0];
    const items = [];
    viewer.scene.modelRoot.children.forEach(c => {
      items.push({
        name: c.name,
        pos: [c.position.x, c.position.y, c.position.z],
        rot: [c.rotation.x, c.rotation.y, c.rotation.z],
        scale: [c.scale.x, c.scale.y, c.scale.z],
        visible: c.visible
      });
    });
    return items;
  });

  console.log('Hierarchy with eternity:\n', JSON.stringify(hierarchy, null, 2));

  // Reset eternity
  await page.click('button:has-text("NO ETERNITY")');
  await page.click('button:has-text("Engagement Ring")');
}

testRefEternity().catch(console.error);
