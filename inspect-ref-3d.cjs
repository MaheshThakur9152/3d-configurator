const { chromium } = require('playwright-core');

async function inspect3D() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const pages = context.pages();
  
  // Find reference page or create one
  let page = pages.find(p => p.url().includes('alloyum.com/demo'));
  if (!page) {
    page = await context.newPage();
    await page.goto('https://alloyum.com/demo/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(4000);
  }

  console.log('Inspecting page:', page.url());

  // Evaluate scripts to find 3D viewer properties
  const info = await page.evaluate(() => {
    // Look for three / webgi / scene references on window or elements
    const winKeys = Object.keys(window).filter(k => 
      k.toLowerCase().includes('three') || 
      k.toLowerCase().includes('viewer') || 
      k.toLowerCase().includes('scene') || 
      k.toLowerCase().includes('app') ||
      k.toLowerCase().includes('canvas') ||
      k.toLowerCase().includes('alloyum')
    );
    
    // Look for canvas
    const canvas = document.querySelector('canvas');
    let canvasInfo = null;
    if (canvas) {
      canvasInfo = {
        width: canvas.width,
        height: canvas.height,
        styleWidth: canvas.style.width,
        styleHeight: canvas.style.height,
        className: canvas.className
      };
    }

    return {
      winKeys,
      canvasInfo
    };
  });

  console.log('Result:', JSON.stringify(info, null, 2));
  
  // Take screenshot of the reference page 3D ring area to see exactly what it looks like right now
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'inspection/screenshots/ref-current-check.png' });
  console.log('Saved inspection/screenshots/ref-current-check.png');
}

inspect3D().catch(console.error);
