const { chromium } = require('playwright-core');

async function inspectHierarchy() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const pages = context.pages();
  let page = pages.find(p => p.url().includes('alloyum.com/demo'));
  
  const hierarchy = await page.evaluate(() => {
    const viewer = window.webGiViewers && window.webGiViewers[0];
    if (!viewer) return null;

    function dump(node, depth = 0) {
      const info = {
        name: node.name,
        type: node.type,
        pos: [node.position.x, node.position.y, node.position.z],
        rot: [node.rotation.x, node.rotation.y, node.rotation.z],
        scale: [node.scale.x, node.scale.y, node.scale.z],
        children: []
      };
      if (node.children) {
        for (const child of node.children) {
          if (!child.isMesh) {
            info.children.push(dump(child, depth + 1));
          } else {
            // just count mesh children
            info.meshCount = (info.meshCount || 0) + 1;
          }
        }
      }
      return info;
    }

    return dump(viewer.scene.modelRoot);
  });

  console.log(JSON.stringify(hierarchy, null, 2));
}

inspectHierarchy().catch(console.error);
