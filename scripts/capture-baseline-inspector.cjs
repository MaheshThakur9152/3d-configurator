const { chromium } = require('playwright-core');
const path = require('path');

(async () => {
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe',
    headless: true,
    args: ['--use-gl=angle', '--use-angle=d3d11', '--enable-webgl']
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('http://localhost:5173');
  await page.waitForTimeout(2000);

  // Switch to Model Inspector
  const inspectorBtn = await page.waitForSelector('text=Model Inspector');
  await inspectorBtn.click();
  await page.waitForTimeout(1000);

  // Upload docs/ring-p25696.glb
  const glbPath = path.resolve('docs/ring-p25696.glb');
  const fileInput = await page.waitForSelector('input[type="file"]', { state: 'attached' });
  await fileInput.setInputFiles(glbPath);
  await page.waitForTimeout(3000);

  await page.screenshot({ path: 'baseline-screenshots/baseline-inspector-ring-p25696.png' });
  console.log('Baseline inspector screenshot captured successfully at baseline-screenshots/baseline-inspector-ring-p25696.png');
  await browser.close();
})();
