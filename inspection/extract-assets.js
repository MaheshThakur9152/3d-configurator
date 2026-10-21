const { chromium } = require('playwright-core');
const fs = require('fs');

async function extractAssets() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const page = browser.contexts()[0].pages().find(p => p.url().includes('alloyum.com/demo'));
  
  const assets = await page.evaluate(() => {
    const imgs = Array.from(document.querySelectorAll('img')).map(img => ({
      type: 'img',
      src: img.src,
      alt: img.alt,
      className: img.className,
      rect: img.getBoundingClientRect()
    }));

    const svgs = Array.from(document.querySelectorAll('svg')).map(svg => ({
      type: 'svg',
      innerHTML: svg.innerHTML,
      outerHTML: svg.outerHTML,
      className: svg.getAttribute('class'),
      width: svg.getAttribute('width') || svg.getBoundingClientRect().width,
      height: svg.getAttribute('height') || svg.getBoundingClientRect().height,
      parentClass: svg.parentElement ? svg.parentElement.className : ''
    }));

    // Find all custom CSS variables on document or body
    const computed = window.getComputedStyle(document.documentElement);
    const cssVars = {};
    for (let i = 0; i < computed.length; i++) {
      const prop = computed[i];
      if (prop.startsWith('--')) {
        cssVars[prop] = computed.getPropertyValue(prop).trim();
      }
    }

    return { imgs, svgs, cssVars };
  });

  fs.writeFileSync('inspection/extracted-assets.json', JSON.stringify(assets, null, 2));
  console.log(`Extracted ${assets.imgs.length} images, ${assets.svgs.length} SVGs, and ${Object.keys(assets.cssVars).length} CSS vars.`);
  await browser.close();
}

extractAssets().catch(console.error);
