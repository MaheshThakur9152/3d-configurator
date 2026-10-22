const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

async function verifyRenderFix() {
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe',
    headless: true,
  });
  const page = await browser.newPage();
  const outDir = path.join(__dirname, 'post-refactor-screenshots');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  await page.setViewportSize({ width: 1440, height: 900 });
  console.log('Navigating to http://localhost:5173/...');
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(4000); // Allow HDR environment to load and apply

  // 1. Desktop Configurator View (White Gold)
  await page.screenshot({ path: path.join(outDir, 'fixed-configurator-desktop.png') });
  console.log('Saved fixed-configurator-desktop.png');

  // Check stats
  const stats = await page.evaluate(() => {
    const r = window.__viewerRenderer;
    const ringGroup = window.__viewerRingGroup;
    let centerMat = null;
    let pavéMat = null;
    let metalMat = null;

    ringGroup.traverse(node => {
      if (node.isMesh) {
        if (node.userData.role === 'centerGem') {
          centerMat = {
            name: node.name,
            matName: node.material.name,
            transmission: node.material.transmission,
            flatShading: node.material.flatShading,
            ior: node.material.ior,
            envMapIntensity: node.material.envMapIntensity,
          };
        } else if (node.userData.role === 'sideGem') {
          pavéMat = {
            name: node.name,
            matName: node.material.name,
            transmission: node.material.transmission,
            flatShading: node.material.flatShading,
          };
        } else if (node.userData.role === 'metal' && !metalMat) {
          metalMat = {
            name: node.name,
            matName: node.material.name,
            metalness: node.material.metalness,
            roughness: node.material.roughness,
            clearcoat: node.material.clearcoat,
          };
        }
      }
    });

    return {
      drawCalls: r.info.render.calls,
      triangles: r.info.render.triangles,
      centerMat,
      pavéMat,
      metalMat,
    };
  });
  console.log('Active Material & Render Stats:', JSON.stringify(stats, null, 2));

  // 2. Yellow Gold
  console.log('Selecting Yellow Gold...');
  const yellowBtn = await page.$('button[title*="Yellow Gold"], button[aria-label*="Yellow Gold"], div:has-text("Metal") + div button:nth-child(1)');
  if (yellowBtn) {
    await yellowBtn.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(outDir, 'fixed-yellow-gold.png') });
    console.log('Saved fixed-yellow-gold.png');
  }

  // 3. Rose Gold
  console.log('Selecting Rose Gold...');
  const roseBtn = await page.$('button[title*="Rose Gold"], button[aria-label*="Rose Gold"], div:has-text("Metal") + div button:nth-child(3)');
  if (roseBtn) {
    await roseBtn.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(outDir, 'fixed-rose-gold.png') });
    console.log('Saved fixed-rose-gold.png');
  }

  // Switch back to White Gold
  const whiteBtn = await page.$('button[title*="White Gold"], button[aria-label*="White Gold"], div:has-text("Metal") + div button:nth-child(2)');
  if (whiteBtn) {
    await whiteBtn.click();
    await page.waitForTimeout(800);
  }

  // 4. Test Model Inspector with docs/ring-p25696.glb
  console.log('Switching to Model Inspector mode...');
  await page.click('button:has-text("Model Inspector")');
  await page.waitForTimeout(1500);

  const testP25696Path = path.join(__dirname, 'docs', 'ring-p25696.glb');
  if (fs.existsSync(testP25696Path)) {
    console.log(`Uploading ${testP25696Path}...`);
    const fileInput = await page.$('input[type="file"]');
    if (fileInput) {
      await fileInput.setInputFiles(testP25696Path);
      await page.waitForTimeout(3000);
      await page.screenshot({ path: path.join(outDir, 'fixed-inspector-p25696.png') });
      console.log('Saved fixed-inspector-p25696.png');

      // Verify Diamond_Oval role in inspector
      const roleText = await page.evaluate(() => {
        // Find node row for Diamond_Oval
        const rows = Array.from(document.querySelectorAll('div, li, tr'));
        const diamondRow = rows.find(r => r.textContent.includes('Diamond_Oval'));
        return diamondRow ? diamondRow.textContent : 'not found';
      });
      console.log('Inspector Diamond_Oval row text:', roleText.replace(/\s+/g, ' ').slice(0, 150));
    }
  }

  await browser.close();
  console.log('Verification completed successfully!');
}

verifyRenderFix().catch(console.error);
