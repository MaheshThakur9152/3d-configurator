const { chromium } = require('playwright-core');

async function measureLayout() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const pages = context.pages();
  let page = pages.find(p => p.url().includes('alloyum.com/demo'));

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.waitForTimeout(1000);

  const rects = await page.evaluate(() => {
    const header = document.querySelector('header');
    const canvas = document.querySelector('canvas');
    const sidebar = document.querySelector('aside') || document.querySelector('.custom-scrollbar') || document.querySelector('[class*="border-l"]');
    
    // Find the main split containers
    const bodyChildren = document.querySelector('main') || document.querySelector('#root') || document.body;
    
    // Check canvas parent and sidebar element
    const canvasContainer = canvas ? canvas.parentElement : null;
    const sidebarContainer = canvasContainer ? canvasContainer.nextElementSibling : null;

    return {
      header: header ? header.getBoundingClientRect() : null,
      canvasContainer: canvasContainer ? {
        className: canvasContainer.className,
        rect: canvasContainer.getBoundingClientRect()
      } : null,
      sidebarContainer: sidebarContainer ? {
        className: sidebarContainer.className,
        rect: sidebarContainer.getBoundingClientRect()
      } : null,
    };
  });

  console.log('Reference Rects:\n', JSON.stringify(rects, null, 2));
}

measureLayout().catch(console.error);
