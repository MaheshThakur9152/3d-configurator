const { chromium } = require('playwright-core');

async function inspectRefGem() {
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

  const matDetails = await page.evaluate(() => {
    const viewer = window.webGiViewers && window.webGiViewers[0];
    if (!viewer) return { error: 'No viewer' };

    const materials = [];
    viewer.scene.modelRoot.traverse((obj) => {
      if (obj.isMesh && obj.material) {
        const mat = obj.material;
        if (!materials.some(m => m.name === mat.name)) {
          const keys = Object.keys(mat);
          materials.push({
            name: mat.name,
            type: mat.type,
            color: mat.color ? [mat.color.r, mat.color.g, mat.color.b] : null,
            roughness: mat.roughness,
            metalness: mat.metalness,
            transmission: mat.transmission,
            ior: mat.ior,
            reflectivity: mat.reflectivity,
            transparent: mat.transparent,
            opacity: mat.opacity,
            clearcoat: mat.clearcoat,
            clearcoatRoughness: mat.clearcoatRoughness,
            envMapIntensity: mat.envMapIntensity,
            dispersion: mat.dispersion,
            attenuationColor: mat.attenuationColor ? [mat.attenuationColor.r, mat.attenuationColor.g, mat.attenuationColor.b] : null,
            attenuationDistance: mat.attenuationDistance,
            thickness: mat.thickness,
            customProps: keys.filter(k => !k.startsWith('_')).slice(0, 30)
          });
        }
      }
    });

    return materials;
  });

  console.log('Reference Materials:\n', JSON.stringify(matDetails, null, 2));

  await page.close();
  if (!isCDP) await browser.close();
}

inspectRefGem().catch(console.error);
