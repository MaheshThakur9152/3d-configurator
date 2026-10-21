const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

async function inspectInteractions() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  let page = context.pages().find(p => p.url().includes('alloyum.com/demo'));
  if (!page) {
    page = await context.newPage();
    await page.goto('https://alloyum.com/demo/', { waitUntil: 'networkidle' });
  }

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.waitForTimeout(1000);

  const screenshotsDir = path.join(__dirname, 'screenshots');

  // Let's inspect the right panel container
  const panelInfo = await page.evaluate(() => {
    // Find scrollable element
    const all = Array.from(document.querySelectorAll('*'));
    const scrollables = all.filter(el => {
      const s = window.getComputedStyle(el);
      return (s.overflowY === 'auto' || s.overflowY === 'scroll') && el.scrollHeight > el.clientHeight;
    });

    return scrollables.map(el => ({
      tagName: el.tagName,
      className: el.className,
      id: el.id,
      scrollHeight: el.scrollHeight,
      clientHeight: el.clientHeight,
      scrollTop: el.scrollTop
    }));
  });
  console.log('Scrollable elements:', panelInfo);

  // Let's scroll the right panel down in steps and screenshot it
  const scrollContainerSelector = panelInfo.length > 0 ? `.${panelInfo[0].className.split(' ').join('.')}` : null;

  // Extract all text and sections in the panel
  const panelSections = await page.evaluate(() => {
    // Find all section headers or groups
    const sections = [];
    const elements = Array.from(document.querySelectorAll('h1, h2, h3, h4, [class*="label"], [class*="title"], [class*="section"]'));
    return elements.map(e => ({
      tag: e.tagName,
      class: e.className,
      text: e.innerText.trim(),
    }));
  });
  fs.writeFileSync(path.join(__dirname, 'sections.json'), JSON.stringify(panelSections, null, 2));

  // Screenshot scrolled right panel
  if (panelInfo.length > 0) {
    for (let scrollPos of [300, 600, 900, 1200, 1500]) {
      await page.evaluate((pos) => {
        const el = document.querySelectorAll('*');
        for (const e of el) {
          const s = window.getComputedStyle(e);
          if ((s.overflowY === 'auto' || s.overflowY === 'scroll') && e.scrollHeight > e.clientHeight) {
            e.scrollTop = pos;
          }
        }
      }, scrollPos);
      await page.waitForTimeout(600);
      await page.screenshot({ path: path.join(screenshotsDir, `panel-scroll-${scrollPos}.png`) });
    }
  }

  // Reset scroll
  await page.evaluate(() => {
    const el = document.querySelectorAll('*');
    for (const e of el) {
      const s = window.getComputedStyle(e);
      if ((s.overflowY === 'auto' || s.overflowY === 'scroll') && e.scrollHeight > e.clientHeight) {
        e.scrollTop = 0;
      }
    }
  });

  // Let's inspect the entire DOM of the right panel
  const panelDetails = await page.evaluate(() => {
    // Find the right sidebar element
    // Typically it's next to the 3D canvas container
    const canvas = document.querySelector('canvas');
    let viewerContainer = canvas ? canvas.parentElement : null;
    while (viewerContainer && viewerContainer.parentElement && viewerContainer.parentElement.children.length < 2) {
      viewerContainer = viewerContainer.parentElement;
    }
    const parent = viewerContainer ? viewerContainer.parentElement : document.body;
    const siblings = viewerContainer ? Array.from(parent.children) : [];
    const sidebar = siblings.find(el => el !== viewerContainer);

    return {
      viewerContainerClass: viewerContainer ? viewerContainer.className : null,
      sidebarClass: sidebar ? sidebar.className : null,
      sidebarHTML: sidebar ? sidebar.innerHTML : null,
    };
  });

  if (panelDetails.sidebarHTML) {
    fs.writeFileSync(path.join(__dirname, 'sidebar.html'), panelDetails.sidebarHTML);
    console.log('Saved sidebar.html');
  }

  // Click on "Eternity Ring" tab and capture screenshot
  console.log('Testing Eternity Ring tab...');
  const tabClicked = await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('*')).filter(el => el.innerText && el.innerText.trim() === 'Eternity Ring');
    if (tabs.length > 0) {
      tabs[0].click();
      return true;
    }
    return false;
  });
  console.log('Eternity tab clicked:', tabClicked);
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(screenshotsDir, 'ref-eternity-tab.png') });

  // Scroll Eternity tab
  await page.evaluate(() => {
    const el = document.querySelectorAll('*');
    for (const e of el) {
      const s = window.getComputedStyle(e);
      if ((s.overflowY === 'auto' || s.overflowY === 'scroll') && e.scrollHeight > e.clientHeight) {
        e.scrollTop = 500;
      }
    }
  });
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(screenshotsDir, 'ref-eternity-tab-scrolled.png') });

  // Switch back to "Engagement Ring"
  await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('*')).filter(el => el.innerText && el.innerText.trim() === 'Engagement Ring');
    if (tabs.length > 0) {
      tabs[0].click();
    }
  });
  await page.waitForTimeout(1000);

  // Test Yellow Gold swatch click
  console.log('Testing Yellow Gold click...');
  const swatchClicked = await page.evaluate(() => {
    // Look for gold swatch (images or buttons)
    const imgs = Array.from(document.querySelectorAll('img')).filter(img => img.src.includes('yellow-gold'));
    if (imgs.length > 0) {
      imgs[0].click();
      return 'img: ' + imgs[0].src;
    }
    return false;
  });
  console.log('Swatch clicked:', swatchClicked);
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(screenshotsDir, 'ref-yellow-gold.png') });

  // Test Rose Gold swatch click
  console.log('Testing Rose Gold click...');
  await page.evaluate(() => {
    const imgs = Array.from(document.querySelectorAll('img')).filter(img => img.src.includes('rose-gold'));
    if (imgs.length > 0) {
      imgs[0].click();
    }
  });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(screenshotsDir, 'ref-rose-gold.png') });

  // Test different diamond shape
  console.log('Testing diamond shape click...');
  await page.evaluate(() => {
    // Shapes row
    const shapes = Array.from(document.querySelectorAll('[class*="shape"], svg, button')).filter(el => {
      const txt = (el.innerText || el.getAttribute('aria-label') || '').toLowerCase();
      return txt.includes('round') || txt.includes('pear') || txt.includes('cushion');
    });
    // Or look for svg icons under shape section
  });

  // Restore white gold
  await page.evaluate(() => {
    const imgs = Array.from(document.querySelectorAll('img')).filter(img => img.src.includes('white-gold'));
    if (imgs.length > 0) {
      imgs[0].click();
    }
  });
  await page.waitForTimeout(1000);

  await browser.close();
  console.log('Inspection complete!');
}

inspectInteractions().catch(console.error);
