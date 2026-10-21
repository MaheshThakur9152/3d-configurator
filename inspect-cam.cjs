const { chromium } = require('playwright-core');

async function inspectCam() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const pages = context.pages();
  let page = pages.find(p => p.url().includes('alloyum.com/demo'));
  
  const camInfo = await page.evaluate(() => {
    const viewer = window.webGiViewers && window.webGiViewers[0];
    const cam = viewer.scene.activeCamera;
    const innerCam = cam && cam._camera;
    const controls = viewer.scene.defaultCameraControl || (cam && cam._controls);
    return {
      innerCamFov: innerCam ? innerCam.fov : null,
      innerCamUp: innerCam ? [innerCam.up.x, innerCam.up.y, innerCam.up.z] : null,
      innerCamPos: innerCam ? [innerCam.position.x, innerCam.position.y, innerCam.position.z] : null,
      target: controls && controls.target ? [controls.target.x, controls.target.y, controls.target.z] : null,
      minPolarAngle: controls ? controls.minPolarAngle : null,
      maxPolarAngle: controls ? controls.maxPolarAngle : null,
      minDistance: controls ? controls.minDistance : null,
      maxDistance: controls ? controls.maxDistance : null,
    };
  });

  console.log('Cam Info:', JSON.stringify(camInfo, null, 2));
}

inspectCam().catch(console.error);
