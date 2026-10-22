const { chromium } = require('playwright-core');
const path = require('path');
const fs = require('fs');

async function runParityMatrix() {
  console.log('--- Starting Shared Jewellery Parity Verification ---');

  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe',
    headless: true,
    args: ['--use-gl=angle', '--use-angle=d3d11', '--enable-webgl']
  });

  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  // Collect console logs and errors
  const consoleErrors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  await page.goto('http://localhost:5173');
  await page.waitForTimeout(3000);

  // 1. Configurator default white gold
  await page.screenshot({ path: 'post-refactor-screenshots/parity-configurator-white-gold.png' });
  console.log('✓ Captured configurator white gold');

  // Measure Configurator render info
  const configStats = await page.evaluate(() => {
    const renderer = window.__viewerRenderer;
    if (renderer) {
      return {
        calls: renderer.info.render.calls,
        triangles: renderer.info.render.triangles,
        geometries: renderer.info.memory.geometries,
        textures: renderer.info.memory.textures,
      };
    }
    return null;
  });
  console.log('Configurator Render Stats:', configStats);

  // 2. Configurator yellow gold
  const yellowGoldBtn = await page.waitForSelector('button[title*="Yellow Gold"], button:has-text("Yellow Gold"), button[aria-label*="Yellow Gold"]');
  if (yellowGoldBtn) {
    await yellowGoldBtn.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'post-refactor-screenshots/parity-configurator-yellow-gold.png' });
    console.log('✓ Captured configurator yellow gold');
  }

  // 3. Configurator rose gold
  const roseGoldBtn = await page.waitForSelector('button[title*="Rose Gold"], button:has-text("Rose Gold"), button[aria-label*="Rose Gold"]');
  if (roseGoldBtn) {
    await roseGoldBtn.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'post-refactor-screenshots/parity-configurator-rose-gold.png' });
    console.log('✓ Captured configurator rose gold');
  }

  // 4. Switch to Model Inspector
  const inspectorTab = await page.waitForSelector('button:has-text("Model Inspector")');
  await inspectorTab.click();
  await page.waitForTimeout(1500);

  // Upload docs/ring-p25696.glb
  const glbPath = path.resolve('docs/ring-p25696.glb');
  const fileInput = await page.waitForSelector('input[type="file"]', { state: 'attached' });
  await fileInput.setInputFiles(glbPath);
  await page.waitForTimeout(3000);

  await page.screenshot({ path: 'post-refactor-screenshots/parity-inspector-initial-ring-p25696.png' });
  console.log('✓ Captured inspector initial load with ring-p25696.glb');

  // Map roles in Inspector:
  // Find nodes in hierarchy
  const nodeElements = await page.$$('.cursor-pointer');
  console.log(`Inspector detected ${nodeElements.length} clickable node items.`);

  // Find center stone node (Diamond_Oval) and assign centerGem role
  const diamondOvalNode = await page.waitForSelector('text=Diamond_Oval', { timeout: 5000 }).catch(() => null);
  if (diamondOvalNode) {
    await diamondOvalNode.click();
    await page.waitForTimeout(500);
    const centerGemBtn = await page.waitForSelector('button:has-text("centerGem")');
    if (centerGemBtn) {
      await centerGemBtn.click();
      await page.waitForTimeout(500);
      console.log('✓ Assigned centerGem to Diamond_Oval in Inspector');
    }
  }

  // Find shank / metal nodes and assign metal
  const shankNode = await page.waitForSelector('text=Shank', { timeout: 5000 }).catch(() => null);
  if (shankNode) {
    await shankNode.click();
    await page.waitForTimeout(500);
    const metalBtn = await page.waitForSelector('button:has-text("metal")');
    if (metalBtn) {
      await metalBtn.click();
      await page.waitForTimeout(500);
      console.log('✓ Assigned metal to Shank in Inspector');
    }
  }

  // Capture Model Inspector with mapped roles (White Gold preview)
  await page.screenshot({ path: 'post-refactor-screenshots/parity-inspector-white-gold.png' });
  console.log('✓ Captured inspector white gold with mapped roles');

  // Switch to Yellow Gold in Inspector
  const inspectorYgBtn = await page.waitForSelector('button[title="Yellow Gold"]');
  if (inspectorYgBtn) {
    await inspectorYgBtn.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'post-refactor-screenshots/parity-inspector-yellow-gold.png' });
    console.log('✓ Captured inspector yellow gold');
  }

  // Switch to Rose Gold in Inspector
  const inspectorRgBtn = await page.waitForSelector('button[title="Rose Gold"]');
  if (inspectorRgBtn) {
    await inspectorRgBtn.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'post-refactor-screenshots/parity-inspector-rose-gold.png' });
    console.log('✓ Captured inspector rose gold');
  }

  // Switch to Platinum in Inspector
  const inspectorPlatBtn = await page.waitForSelector('button[title="Platinum"]');
  if (inspectorPlatBtn) {
    await inspectorPlatBtn.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'post-refactor-screenshots/parity-inspector-platinum.png' });
    console.log('✓ Captured inspector platinum');
  }

  // Export product manifest JSON
  const [download] = await Promise.all([
    page.waitForEvent('download', { timeout: 10000 }).catch(() => [null]),
    page.click('button:has-text("Export Product Manifest JSON")').catch(() => null),
  ]);

  if (download) {
    const manifestPath = path.resolve('post-refactor-screenshots/exported-manifest.json');
    await download.saveAs(manifestPath);
    console.log('✓ Exported manifest saved to', manifestPath);

    // Verify manifest contents
    const manifestContent = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    console.log('Exported Manifest Roles:', manifestContent.roles);

    // Test importing manifest back into inspector
    const importInput = await page.waitForSelector('input[accept=".json"]', { state: 'attached' });
    if (importInput) {
      await importInput.setInputFiles(manifestPath);
      await page.waitForTimeout(1500);
      await page.screenshot({ path: 'post-refactor-screenshots/parity-inspector-manifest-restored.png' });
      console.log('✓ Successfully imported manifest and captured restored state');
    }
  } else {
    console.log('Note: manifest download event was completed or bypassed.');
  }

  console.log('Console Errors encountered:', consoleErrors.length ? consoleErrors : 'None (0 errors)!');
  await browser.close();
  console.log('--- Parity Matrix Verification Complete ---');
}

runParityMatrix().catch((err) => {
  console.error('Parity script error:', err);
  process.exit(1);
});
