const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

async function captureScreens() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  let page = context.pages().find(p => p.url().includes('alloyum.com/demo'));
  if (!page) {
    page = await context.newPage();
    await page.goto('https://alloyum.com/demo/', { waitUntil: 'networkidle' });
  }

  const screenshotsDir = path.join(__dirname, 'screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  const viewports = [
    { name: 'desktop-1440x900', width: 1440, height: 900 },
    { name: 'laptop-1280x800', width: 1280, height: 800 },
    { name: 'tablet-768x1024', width: 768, height: 1024 },
    { name: 'mobile-390x844', width: 390, height: 844 },
    { name: 'narrow-360x800', width: 360, height: 800 },
  ];

  for (const vp of viewports) {
    console.log(`Setting viewport: ${vp.name} (${vp.width}x${vp.height})`);
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.waitForTimeout(2000); // allow canvas and responsive layout to adapt

    const screenshotPath = path.join(screenshotsDir, `ref-${vp.name}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: false });
    console.log(`Saved screenshot: ${screenshotPath}`);

    const fullPagePath = path.join(screenshotsDir, `ref-${vp.name}-full.png`);
    await page.screenshot({ path: fullPagePath, fullPage: true });
  }

  // Restore desktop 1440x900 for detail inspection
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.waitForTimeout(1000);

  // Extract detailed layout metrics
  const layoutMetrics = await page.evaluate(() => {
    function getDetails(selector) {
      const el = document.querySelector(selector);
      if (!el) return null;
      const rect = el.getBoundingClientRect();
      const style = window.getComputedStyle(el);
      return {
        selector,
        rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
        styles: {
          display: style.display,
          position: style.position,
          backgroundColor: style.backgroundColor,
          color: style.color,
          fontFamily: style.fontFamily,
          fontSize: style.fontSize,
          fontWeight: style.fontWeight,
          lineHeight: style.lineHeight,
          letterSpacing: style.letterSpacing,
          padding: style.padding,
          margin: style.margin,
          gap: style.gap,
          border: style.border,
          borderRadius: style.borderRadius,
          boxShadow: style.boxShadow,
          zIndex: style.zIndex,
        }
      };
    }

    // Key selectors
    const keys = [
      'header',
      'nav',
      'main',
      'footer',
      'canvas',
      '[class*="header"]',
      '[class*="sidebar"]',
      '[class*="panel"]',
      '[class*="toolbar"]',
      '[class*="price"]',
      '[class*="title"]',
      '[class*="description"]',
      '[class*="tab"]',
      '[class*="metal"]',
      '[class*="carat"]',
      '[class*="shape"]',
      'button'
    ];

    const results = {};
    for (const k of keys) {
      const list = Array.from(document.querySelectorAll(k));
      results[k] = list.slice(0, 5).map(el => {
        const rect = el.getBoundingClientRect();
        const style = window.getComputedStyle(el);
        return {
          tag: el.tagName.toLowerCase(),
          className: el.className,
          id: el.id,
          text: (el.innerText || '').slice(0, 80).replace(/\n/g, ' '),
          rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
          styles: {
            display: style.display,
            position: style.position,
            backgroundColor: style.backgroundColor,
            color: style.color,
            fontFamily: style.fontFamily,
            fontSize: style.fontSize,
            fontWeight: style.fontWeight,
            lineHeight: style.lineHeight,
            padding: style.padding,
            margin: style.margin,
            borderRadius: style.borderRadius,
            border: style.border,
            boxShadow: style.boxShadow,
          }
        };
      });
    }
    return results;
  });

  fs.writeFileSync(path.join(__dirname, 'layout-metrics.json'), JSON.stringify(layoutMetrics, null, 2));
  console.log('Saved layout-metrics.json');

  await browser.close();
}

captureScreens().catch(console.error);
