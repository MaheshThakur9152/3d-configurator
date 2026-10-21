const { chromium } = require('playwright-core');
const fs = require('fs');

async function inspectGemGLSL() {
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

  const shaders = await page.evaluate(() => {
    const viewer = window.webGiViewers && window.webGiViewers[0];
    let gemMat = null;
    viewer.scene.modelRoot.traverse((obj) => {
      if (obj.isMesh && obj.material && obj.material.name === 'Gem 01') {
        gemMat = obj.material;
      }
    });

    if (!gemMat) return null;
    return {
      vs: gemMat.vertexShader,
      fs: gemMat.fragmentShader
    };
  });

  if (shaders) {
    fs.writeFileSync('inspection/gem-vertex.glsl', shaders.vs);
    fs.writeFileSync('inspection/gem-fragment.glsl', shaders.fs);
    console.log('Saved inspection/gem-vertex.glsl and inspection/gem-fragment.glsl');
    console.log('VS length:', shaders.vs.length, 'FS length:', shaders.fs.length);
  } else {
    console.error('Could not find Gem 01 shaders');
  }

  await page.close();
  if (!isCDP) await browser.close();
}

inspectGemGLSL().catch(console.error);
