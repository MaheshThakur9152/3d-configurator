const { chromium } = require('playwright-core');

async function inspectViewer() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const pages = context.pages();
  let page = pages.find(p => p.url().includes('alloyum.com/demo'));
  if (!page) {
    console.error('Page not found');
    return;
  }

  const details = await page.evaluate(() => {
    try {
      const viewer = window.webGiViewers && window.webGiViewers[0];
      if (!viewer) return { error: 'No viewer found in window.webGiViewers' };

      const cam = viewer.scene && viewer.scene.activeCamera;
      const controls = cam && cam.controls;
      
      const camPos = cam ? [cam.position.x, cam.position.y, cam.position.z] : null;
      const camTarget = controls && controls.target ? [controls.target.x, controls.target.y, controls.target.z] : null;
      
      // Let's inspect objects in the scene
      const objects = [];
      if (viewer.scene && viewer.scene.modelRoot) {
        viewer.scene.modelRoot.traverse((obj) => {
          if (obj.isMesh) {
            objects.push({
              name: obj.name,
              parentName: obj.parent ? obj.parent.name : null,
              position: [obj.position.x, obj.position.y, obj.position.z],
              rotation: [obj.rotation.x, obj.rotation.y, obj.rotation.z],
              scale: [obj.scale.x, obj.scale.y, obj.scale.z],
              materialName: obj.material ? obj.material.name : null,
              materialType: obj.material ? obj.material.type : null,
            });
          }
        });
      }

      // Root scene transformations
      const modelRoot = viewer.scene.modelRoot;
      const rootTransform = modelRoot ? {
        position: [modelRoot.position.x, modelRoot.position.y, modelRoot.position.z],
        rotation: [modelRoot.rotation.x, modelRoot.rotation.y, modelRoot.rotation.z],
        scale: [modelRoot.scale.x, modelRoot.scale.y, modelRoot.scale.z],
      } : null;

      return {
        camPos,
        camTarget,
        camFov: cam ? cam.fov : null,
        rootTransform,
        objectsCount: objects.length,
        objects: objects.slice(0, 10), // first 10
      };
    } catch (e) {
      return { error: e.message, stack: e.stack };
    }
  });

  console.log('Viewer Details:\n', JSON.stringify(details, null, 2));
}

inspectViewer().catch(console.error);
