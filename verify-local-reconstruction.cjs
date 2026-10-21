const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

async function verifyLocal() {
  let browser;
  let isCDP = false;
  try {
    browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
    isCDP = true;
    console.log('Connected to Brave via CDP at http://127.0.0.1:9222');
  } catch (err) {
    console.log('CDP connection failed, launching Brave directly via executablePath...');
    browser = await chromium.launch({
      executablePath: 'C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe',
      headless: true,
    });
  }

  const context = isCDP ? browser.contexts()[0] : await browser.newContext();
  const page = await context.newPage();

  const comparisonDir = path.join(__dirname, 'comparison');
  if (!fs.existsSync(comparisonDir)) {
    fs.mkdirSync(comparisonDir, { recursive: true });
  }

  console.log('Navigating to http://localhost:5173/...');
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500); // Wait for WebGL 3D models to load & render

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
    await page.waitForTimeout(1000);
    const screenshotPath = path.join(comparisonDir, `local-${vp.name}.png`);
    await page.screenshot({ path: screenshotPath });
    console.log(`Saved screenshot: ${screenshotPath}`);
  }

  // Restore desktop 1440x900
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.waitForTimeout(1000);

  // Test Yellow Gold click
  console.log('Testing Yellow Gold swatch click...');
  await page.click('button[title="Yellow Gold"]');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(comparisonDir, 'local-yellow-gold.png') });

  // Test Rose Gold click
  console.log('Testing Rose Gold swatch click...');
  await page.click('button[title="Rose Gold"]');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(comparisonDir, 'local-rose-gold.png') });

  // Test White Gold restore
  console.log('Testing White Gold swatch click...');
  await page.click('button[title="White Gold"]');
  await page.waitForTimeout(1000);

  // Test Eternity Ring tab & ADD ETERNITY
  console.log('Testing Eternity Ring tab...');
  await page.click('button:has-text("Eternity Ring")');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(comparisonDir, 'local-eternity-tab.png') });

  console.log('Testing ADD ETERNITY click...');
  await page.click('button:has-text("ADD ETERNITY")');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(comparisonDir, 'local-add-eternity.png') });

  // Switch back to Engagement Ring tab
  await page.click('button:has-text("Engagement Ring")');
  await page.waitForTimeout(1000);

  // Test Enquiry Modal
  console.log('Testing Enquiry Modal...');
  await page.click('button:has-text("INTERESTED, ENQUIRE?")');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(comparisonDir, 'local-enquiry-modal.png') });

  // Close modal
  await page.click('button[aria-label="Close modal"]');
  await page.waitForTimeout(1000);

  // Test Fullscreen
  console.log('Testing Fullscreen...');
  await page.click('button[aria-label="Open in Full Screen"]');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(comparisonDir, 'local-fullscreen.png') });

  // Exit fullscreen
  await page.click('button[aria-label="Exit Full Screen"]');
  await page.waitForTimeout(1000);

  await page.close();
  if (!isCDP) await browser.close();
  console.log('Verification finished successfully!');
}

verifyLocal().catch(console.error);
