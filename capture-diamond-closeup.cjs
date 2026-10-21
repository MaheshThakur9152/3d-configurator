const { chromium } = require('playwright-core');
const path = require('path');

async function capture() {
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
  const page = await context.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3500);

  const canvas = await page.$('canvas');
  if (canvas) {
    await canvas.screenshot({ path: path.join(__dirname, 'post-refactor-screenshots', 'diamond-detail.png') });
    console.log('Saved updated diamond-detail.png');
  }

  await page.screenshot({ path: path.join(__dirname, 'post-refactor-screenshots', 'refactored-desktop-1440x900.png') });
  console.log('Saved updated refactored-desktop-1440x900.png');

  await page.close();
  if (!isCDP) await browser.close();
}

capture().catch(console.error);
