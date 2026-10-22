const { chromium } = require('playwright-core');

async function diagnose() {
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe',
    headless: true,
    args: ['--use-gl=angle', '--use-angle=d3d11', '--enable-webgl']
  });

  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('http://localhost:5173');
  await page.waitForTimeout(3000);

  const diag = await page.evaluate(() => {
    const scene = window.__viewerScene;
    const ringGroup = window.__viewerRingGroup;
    const results = [];

    if (scene) {
      scene.traverse((child) => {
        if (child.isMesh) {
          const mesh = child;
          const geo = mesh.geometry;
          const pos = geo.attributes.position;
          const norm = geo.attributes.normal;
          const triCount = geo.index ? geo.index.count / 3 : pos.count / 3;

          geo.computeBoundingBox();
          const bb = geo.boundingBox;
          const size = {
            x: bb.max.x - bb.min.x,
            y: bb.max.y - bb.min.y,
            z: bb.max.z - bb.min.z,
          };

          const wp = { x: 0, y: 0, z: 0 };
          if (mesh.matrixWorld) {
            wp.x = mesh.matrixWorld.elements[12];
            wp.y = mesh.matrixWorld.elements[13];
            wp.z = mesh.matrixWorld.elements[14];
          }

          results.push({
            name: mesh.name,
            role: mesh.userData.role,
            assignedRole: mesh.userData.assignedRole,
            materialName: mesh.material?.name,
            materialType: mesh.material?.type,
            triangles: triCount,
            indexed: !!geo.index,
            hasNormals: !!norm,
            size,
            worldPos: wp,
            scale: { x: mesh.scale.x, y: mesh.scale.y, z: mesh.scale.z },
          });
        }
      });
    }
    return results;
  });

  console.log('=== Active Scene Meshes Diagnostic ===');
  console.dir(diag, { depth: null });

  await browser.close();
}

diagnose().catch(console.error);
