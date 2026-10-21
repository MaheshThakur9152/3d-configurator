const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

async function main() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const contexts = browser.contexts();
  const context = contexts[0];
  const pages = context.pages();
  let page = pages.find(p => p.url().includes('alloyum.com/demo'));
  
  if (!page) {
    console.log('Page not found in open tabs, opening new page...');
    page = await context.newPage();
    await page.goto('https://alloyum.com/demo/', { waitUntil: 'networkidle' });
  }

  console.log('Found page:', page.url(), await page.title());

  // Collect performance resource timing to see all loaded models, textures, scripts
  const resources = await page.evaluate(() => {
    return performance.getEntriesByType('resource').map(r => ({
      name: r.name,
      initiatorType: r.initiatorType,
      transferSize: r.transferSize,
      decodedBodySize: r.decodedBodySize
    }));
  });

  fs.writeFileSync(
    path.join(__dirname, 'resources.json'),
    JSON.stringify(resources, null, 2)
  );
  console.log(`Saved ${resources.length} resource entries to resources.json`);

  // Extract full HTML
  const html = await page.content();
  fs.writeFileSync(path.join(__dirname, 'page.html'), html);
  console.log('Saved page.html');

  // Inspect 3D canvas and WebGL
  const webglInfo = await page.evaluate(() => {
    const canvases = Array.from(document.querySelectorAll('canvas'));
    return canvases.map(c => {
      const rect = c.getBoundingClientRect();
      const gl = c.getContext('webgl2') || c.getContext('webgl');
      let debugInfo = {};
      if (gl) {
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        debugInfo = {
          vendor: ext ? gl.getParameter(ext.UNMASKED_VENDOR_WEBGL) : gl.getParameter(gl.VENDOR),
          renderer: ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER),
        };
      }
      return {
        id: c.id,
        className: c.className,
        width: c.width,
        height: c.height,
        rect: { top: rect.top, left: rect.left, width: rect.width, height: rect.height },
        debugInfo
      };
    });
  });
  fs.writeFileSync(path.join(__dirname, 'webgl-info.json'), JSON.stringify(webglInfo, null, 2));
  console.log('Saved webgl-info.json:', webglInfo);

  // Check globals (Three, Babylon, etc.)
  const globals = await page.evaluate(() => {
    const keys = Object.keys(window).filter(k => 
      /three|babylon|model|ring|config|viewer|scene|engine|alloy/i.test(k)
    );
    return {
      keys,
      hasThree: typeof window.THREE !== 'undefined',
      hasBABYLON: typeof window.BABYLON !== 'undefined',
    };
  });
  console.log('Globals:', globals);

  // Extract DOM hierarchy of controls, headers, buttons, layout
  const domStructure = await page.evaluate(() => {
    function summarize(el) {
      if (!el) return null;
      const rect = el.getBoundingClientRect();
      const style = window.getComputedStyle(el);
      return {
        tag: el.tagName.toLowerCase(),
        id: el.id,
        className: el.className,
        text: el.innerText ? el.innerText.slice(0, 100) : '',
        rect: { top: rect.top, left: rect.left, width: rect.width, height: rect.height },
        computed: {
          display: style.display,
          flexDirection: style.flexDirection,
          gridTemplateColumns: style.gridTemplateColumns,
          position: style.position,
          backgroundColor: style.backgroundColor,
          color: style.color,
          fontFamily: style.fontFamily,
          fontSize: style.fontSize,
          fontWeight: style.fontWeight,
          lineHeight: style.lineHeight,
          padding: style.padding,
          margin: style.margin,
          border: style.border,
          borderRadius: style.borderRadius,
          boxShadow: style.boxShadow
        }
      };
    }

    const interactive = Array.from(document.querySelectorAll('button, a, input, select, [role="button"], [role="tab"], [role="radio"]')).map(el => {
      const rect = el.getBoundingClientRect();
      const style = window.getComputedStyle(el);
      return {
        tag: el.tagName.toLowerCase(),
        id: el.id,
        role: el.getAttribute('role'),
        type: el.getAttribute('type'),
        ariaSelected: el.getAttribute('aria-selected'),
        ariaChecked: el.getAttribute('aria-checked'),
        className: el.className,
        text: (el.innerText || el.getAttribute('aria-label') || el.value || '').trim(),
        rect: { top: rect.top, left: rect.left, width: rect.width, height: rect.height },
        styles: {
          backgroundColor: style.backgroundColor,
          color: style.color,
          fontSize: style.fontSize,
          fontWeight: style.fontWeight,
          border: style.border,
          borderRadius: style.borderRadius,
          boxShadow: style.boxShadow,
          outline: style.outline
        }
      };
    });

    return { interactive };
  });
  fs.writeFileSync(path.join(__dirname, 'dom-structure.json'), JSON.stringify(domStructure, null, 2));
  console.log(`Found ${domStructure.interactive.length} interactive elements.`);

  await browser.disconnect();
}

main().catch(console.error);
