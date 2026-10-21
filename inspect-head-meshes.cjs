const { chromium } = require('playwright-core');

async function inspectHeadMeshes() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const pages = context.pages();
  let page = pages.find(p => p.url().includes('alloyum.com/demo'));

  const meshList = await page.evaluate(() => {
    const viewer = window.webGiViewers && window.webGiViewers[0];
    const head = viewer.scene.modelRoot.children.find(c => c.name.includes('HD'));
    if (!head) return null;

    return head.children.map(m => ({
      name: m.name,
      mat: m.material ? m.material.name : null,
      pos: [m.position.x, m.position.y, m.position.z],
      rot: [m.rotation.x, m.rotation.y, m.rotation.z],
      scale: [m.scale.x, m.scale.y, m.scale.z],
    }));
  });

  console.log('Head meshes count:', meshList ? meshList.length : 0);
  console.log('Head meshes with Gem 01:\n', JSON.stringify(meshList ? meshList.filter(m => m.mat === 'Gem 01') : null, null, 2));
  console.log('First 3 metal meshes:\n', JSON.stringify(meshList ? meshList.filter(m => m.mat === 'Metal 02').slice(0, 3) : null, null, 2));
}

inspectHeadMeshes().catch(console.error);
