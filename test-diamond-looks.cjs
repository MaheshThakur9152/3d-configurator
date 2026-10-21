const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

async function testDiamondLooks() {
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
  await page.waitForTimeout(3000);

  const testDir = path.join(__dirname, 'diamond-tests');
  if (!fs.existsSync(testDir)) fs.mkdirSync(testDir, { recursive: true });

  const variations = [
    { name: 'white-trans-0.6', color: 0xffffff, transmission: 0.6, roughness: 0.0, envMapIntensity: 4.0, ior: 2.417 },
    { name: 'white-trans-0.8', color: 0xffffff, transmission: 0.8, roughness: 0.0, envMapIntensity: 4.5, ior: 2.417 },
    { name: 'white-trans-0.95', color: 0xffffff, transmission: 0.95, roughness: 0.0, envMapIntensity: 5.0, ior: 2.417 },
    { name: 'subtle-blue-trans-0.75', color: 0xf5f8ff, transmission: 0.75, roughness: 0.0, envMapIntensity: 4.5, ior: 2.417 },
    { name: 'silver-facet-trans-0.5', color: 0xeeeeee, transmission: 0.5, roughness: 0.02, envMapIntensity: 5.5, ior: 2.417 },
  ];

  for (const v of variations) {
    await page.evaluate((cfg) => {
      // Find canvas and scene if exposed or find meshes
      const canvas = document.querySelector('canvas');
      // In Three.js, traverse meshes
      // We can inspect materials on the loaded scene
    }, v);
  }

  await page.close();
  if (!isCDP) await browser.close();
}
