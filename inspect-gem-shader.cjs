const { chromium } = require('playwright-core');

async function inspectGemShader() {
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

  const gemShader = await page.evaluate(() => {
    const viewer = window.webGiViewers && window.webGiViewers[0];
    if (!viewer) return null;

    let gemMat = null;
    viewer.scene.modelRoot.traverse((obj) => {
      if (obj.isMesh && obj.material && obj.material.name === 'Gem 01') {
        gemMat = obj.material;
      }
    });

    if (!gemMat) return null;

    const uniforms = {};
    if (gemMat.uniforms) {
      for (const k of Object.keys(gemMat.uniforms)) {
        const val = gemMat.uniforms[k]?.value;
        if (typeof val === 'number' || typeof val === 'boolean' || typeof val === 'string') {
          uniforms[k] = val;
        } else if (val && val.isColor) {
          uniforms[k] = [val.r, val.g, val.b];
        } else if (val && val.isVector3) {
          uniforms[k] = [val.x, val.y, val.z];
        } else if (val && val.isTexture) {
          uniforms[k] = 'Texture:' + val.name;
        }
      }
    }

    return {
      name: gemMat.name,
      type: gemMat.type,
      defines: gemMat.defines,
      uniforms,
      extraProps: Object.keys(gemMat).filter(k => !k.startsWith('_')).slice(0, 30)
    };
  });

  console.log('Gem Shader Details:\n', JSON.stringify(gemShader, null, 2));

  await page.close();
  if (!isCDP) await browser.close();
}

inspectGemShader().catch(console.error);
