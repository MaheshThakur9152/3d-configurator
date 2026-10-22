const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

async function verifyPlatform() {
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

  const outDir = path.join(__dirname, 'post-refactor-screenshots');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  console.log('Navigating to http://localhost:5173/...');
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);

  // 1. Desktop Configurator View
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(outDir, 'platform-configurator-desktop.png') });
  console.log('Saved platform-configurator-desktop.png');

  // 2. Switch to Model Inspector View
  console.log('Switching to Model Inspector mode...');
  await page.click('button:has-text("Model Inspector")');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(outDir, 'platform-inspector-empty.png') });
  console.log('Saved platform-inspector-empty.png');

  // 3. Test File Upload in Model Inspector using an existing GLB
  const testGlbPath = path.join(__dirname, 'public', 'assets', 'models', 'sh_pave_1.glb');
  if (fs.existsSync(testGlbPath)) {
    console.log(`Uploading test GLB model: ${testGlbPath}...`);
    const fileInput = await page.$('input[type="file"]');
    if (fileInput) {
      await fileInput.setInputFiles(testGlbPath);
      await page.waitForTimeout(3500); // allow decompression & auto-framing
      await page.screenshot({ path: path.join(outDir, 'platform-inspector-loaded.png') });
      console.log('Saved platform-inspector-loaded.png');

      // Click Yellow Gold swatch in inspector
      const yellowSwatch = await page.$('button[title="Yellow Gold"]');
      if (yellowSwatch) {
        await yellowSwatch.click();
        await page.waitForTimeout(1000);
        await page.screenshot({ path: path.join(outDir, 'platform-inspector-yellow-gold.png') });
        console.log('Saved platform-inspector-yellow-gold.png');
      }
    }
  }

  // 4. Switch back to Configurator
  console.log('Switching back to Configurator...');
  await page.click('button:has-text("Configurator")');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(outDir, 'platform-configurator-restored.png') });
  console.log('Saved platform-configurator-restored.png');

  await page.close();
  if (!isCDP) await browser.close();
  console.log('Platform verification completed successfully!');
}

verifyPlatform().catch(console.error);
