const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

async function testMoreInteractions() {
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

  // Let's inspect the shapes
  console.log('Testing shape click...');
  const shapeInfo = await page.evaluate(() => {
    // Let's find shape icons
    const shapeLabels = ['Cushion', 'Emerald', 'Oval', 'Pear', 'Round'];
    // Look at elements near "Shape:"
    const shapeHeader = Array.from(document.querySelectorAll('*')).find(el => el.innerText && el.innerText.startsWith('Shape:'));
    let container = shapeHeader ? shapeHeader.nextElementSibling : null;
    let buttons = container ? Array.from(container.querySelectorAll('button, div, svg')) : [];
    return {
      header: shapeHeader ? shapeHeader.innerText : null,
      containerTag: container ? container.tagName : null,
      buttonCount: buttons.length,
      html: container ? container.innerHTML : null
    };
  });
  console.log('Shape info:', shapeInfo);

  // Test clicking Round shape
  const roundClicked = await page.evaluate(() => {
    // The 5 shape buttons: Cushion (0), Emerald (1), Oval (2), Pear (3), Round (4)
    const shapeHeader = Array.from(document.querySelectorAll('*')).find(el => el.innerText && el.innerText.startsWith('Shape:'));
    if (!shapeHeader) return false;
    const container = shapeHeader.nextElementSibling;
    if (!container) return false;
    const items = Array.from(container.children);
    if (items.length >= 5) {
      items[4].click(); // Round
      return 'clicked Round';
    }
    return false;
  });
  console.log('Round clicked:', roundClicked);
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(screenshotsDir, 'interaction-round-shape.png') });

  // Test clicking Cushion shape
  await page.evaluate(() => {
    const shapeHeader = Array.from(document.querySelectorAll('*')).find(el => el.innerText && el.innerText.startsWith('Shape:'));
    const container = shapeHeader.nextElementSibling;
    const items = Array.from(container.children);
    if (items.length > 0) items[0].click(); // Cushion
  });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(screenshotsDir, 'interaction-cushion-shape.png') });

  // Restore Oval shape
  await page.evaluate(() => {
    const shapeHeader = Array.from(document.querySelectorAll('*')).find(el => el.innerText && el.innerText.startsWith('Shape:'));
    const container = shapeHeader.nextElementSibling;
    const items = Array.from(container.children);
    if (items.length >= 3) items[2].click(); // Oval
  });
  await page.waitForTimeout(1500);

  // Test Sapphire gemstone click
  console.log('Testing Sapphire gemstone click...');
  const sapphireClicked = await page.evaluate(() => {
    const centerHeader = Array.from(document.querySelectorAll('*')).find(el => el.innerText && el.innerText.startsWith('Centerstone:'));
    if (!centerHeader) return false;
    const container = centerHeader.nextElementSibling;
    if (!container) return false;
    const items = Array.from(container.children);
    if (items.length >= 2) {
      items[1].click(); // Sapphire (blue)
      return 'clicked sapphire';
    }
    return false;
  });
  console.log('Sapphire clicked:', sapphireClicked);
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(screenshotsDir, 'interaction-sapphire.png') });

  // Test Ruby gemstone click
  await page.evaluate(() => {
    const centerHeader = Array.from(document.querySelectorAll('*')).find(el => el.innerText && el.innerText.startsWith('Centerstone:'));
    const container = centerHeader.nextElementSibling;
    const items = Array.from(container.children);
    if (items.length >= 3) items[2].click(); // Ruby
  });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(screenshotsDir, 'interaction-ruby.png') });

  // Restore Diamond centerstone
  await page.evaluate(() => {
    const centerHeader = Array.from(document.querySelectorAll('*')).find(el => el.innerText && el.innerText.startsWith('Centerstone:'));
    const container = centerHeader.nextElementSibling;
    const items = Array.from(container.children);
    if (items.length > 0) items[0].click(); // Diamond
  });
  await page.waitForTimeout(1000);

  // Test Carat change (e.g. 2.00 ct)
  console.log('Testing Carat change...');
  await page.evaluate(() => {
    const caratHeader = Array.from(document.querySelectorAll('*')).find(el => el.innerText && el.innerText.startsWith('Carat:'));
    if (!caratHeader) return;
    const container = caratHeader.nextElementSibling;
    if (!container) return;
    const items = Array.from(container.children);
    if (items.length >= 3) items[2].click(); // 2.00 ct
  });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(screenshotsDir, 'interaction-carat-2ct.png') });

  // Restore 1.00 ct
  await page.evaluate(() => {
    const caratHeader = Array.from(document.querySelectorAll('*')).find(el => el.innerText && el.innerText.startsWith('Carat:'));
    const container = caratHeader.nextElementSibling;
    const items = Array.from(container.children);
    if (items.length >= 2) items[1].click(); // 1.00 ct
  });
  await page.waitForTimeout(1000);

  // Test Eternity Ring -> "ADD ETERNITY"
  console.log('Testing Eternity Ring ADD ETERNITY...');
  await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('*')).filter(el => el.innerText && el.innerText.trim() === 'Eternity Ring');
    if (tabs.length > 0) tabs[0].click();
  });
  await page.waitForTimeout(1000);
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText && b.innerText.includes('ADD ETERNITY'));
    if (btn) btn.click();
  });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(screenshotsDir, 'interaction-add-eternity.png') });

  // Check what controls appeared in Eternity tab when ADD ETERNITY is active
  const eternityControls = await page.evaluate(() => {
    const text = document.body.innerText;
    return text.slice(text.indexOf('Eternity Ring:'), text.indexOf('INTERESTED, ENQUIRE?'));
  });
  console.log('Eternity controls active text:\n', eternityControls);

  // Reset eternity to NO ETERNITY and back to Engagement Ring tab
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText && b.innerText.includes('NO ETERNITY'));
    if (btn) btn.click();
    const tabs = Array.from(document.querySelectorAll('*')).filter(el => el.innerText && el.innerText.trim() === 'Engagement Ring');
    if (tabs.length > 0) tabs[0].click();
  });
  await page.waitForTimeout(1000);

  // Test "INTERESTED, ENQUIRE?" button
  console.log('Testing enquiry button click...');
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText && b.innerText.includes('INTERESTED, ENQUIRE?'));
    if (btn) btn.click();
  });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(screenshotsDir, 'interaction-enquire-modal.png') });

  // Close modal if open
  await page.evaluate(() => {
    const closeBtn = document.querySelector('[aria-label="Close"], button.close, [class*="close"]');
    if (closeBtn) closeBtn.click();
    else {
      // press Escape
      const evt = new KeyboardEvent('keydown', { key: 'Escape', code: 'Escape', keyCode: 27, which: 27, bubbles: true });
      document.dispatchEvent(evt);
    }
  });
  await page.waitForTimeout(1000);

  // Test Fullscreen button
  console.log('Testing Fullscreen button...');
  await page.evaluate(() => {
    const expandBtn = document.querySelector('button[class*="fullscreen"], button:has(svg path[d*="M3"]), button:has(svg path[d*="expand"])') ||
      Array.from(document.querySelectorAll('button')).find(b => {
        const r = b.getBoundingClientRect();
        return r.left > 800 && r.top > 700;
      });
    if (expandBtn) expandBtn.click();
  });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(screenshotsDir, 'interaction-fullscreen.png') });

  // Click fullscreen button again to exit
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const expandBtn = btns.find(b => {
      const r = b.getBoundingClientRect();
      return r.top > 700;
    });
    if (expandBtn) expandBtn.click();
  });

  await browser.close();
  console.log('All detailed interactions tested!');
}

testMoreInteractions().catch(console.error);
