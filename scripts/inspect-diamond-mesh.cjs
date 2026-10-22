const { chromium } = require('playwright-core');

async function inspectDiamondMesh() {
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe',
    headless: true,
    args: ['--use-gl=angle', '--use-angle=d3d11', '--enable-webgl']
  });

  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('http://localhost:5173');
  await page.waitForTimeout(3000);

  const meshDetails = await page.evaluate(() => {
    const scene = window.__viewerScene;
    let diamondMesh = null;
    scene.traverse((child) => {
      if (child.isMesh && child.name === 'mesh_21') {
        diamondMesh = child;
      }
    });

    if (!diamondMesh) return null;

    const geo = diamondMesh.geometry;
    const pos = geo.attributes.position;
    const norm = geo.attributes.normal;

    // Sample normal vectors
    const normalSamples = [];
    for (let i = 0; i < Math.min(pos.count, 30); i += 3) {
      normalSamples.push({
        vIndex: i,
        pos: [pos.getX(i), pos.getY(i), pos.getZ(i)],
        norm: [norm.getX(i), norm.getY(i), norm.getZ(i)],
      });
    }

    // Min/max of positions
    let minY = Infinity, maxY = -Infinity;
    let minZ = Infinity, maxZ = -Infinity;
    let minX = Infinity, maxX = -Infinity;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
      if (x < minX) minX = x; if (x > maxX) maxX = x;
      if (y < minY) minY = y; if (y > maxY) maxY = y;
      if (z < minZ) minZ = z; if (z > maxZ) maxZ = z;
    }

    // Check table facet: where is the flat table facet?
    // Table facet typically has normal pointing along the table direction
    const normalDirections = { posZ: 0, negZ: 0, posY: 0, negY: 0, posX: 0, negX: 0 };
    for (let i = 0; i < norm.count; i++) {
      const nx = norm.getX(i), ny = norm.getY(i), nz = norm.getZ(i);
      if (ny > 0.9) normalDirections.posY++;
      if (ny < -0.9) normalDirections.negY++;
      if (nz > 0.9) normalDirections.posZ++;
      if (nz < -0.9) normalDirections.negZ++;
      if (nx > 0.9) normalDirections.posX++;
      if (nx < -0.9) normalDirections.negX++;
    }

    return {
      name: diamondMesh.name,
      posCount: pos.count,
      bounds: { minX, maxX, minY, maxY, minZ, maxZ },
      normalDirections,
      normalSamples,
      uniforms: {
        refractiveIndex: diamondMesh.material.uniforms?.refractiveIndex?.value,
        dispersion: diamondMesh.material.uniforms?.dispersion?.value,
        envMapIntensity: diamondMesh.material.uniforms?.envMapIntensity?.value,
        boost: diamondMesh.material.uniforms?.boost?.value,
        facetExtinction: diamondMesh.material.uniforms?.facetExtinction?.value,
      }
    };
  });

  console.log('Diamond Mesh Analysis:');
  console.dir(meshDetails, { depth: null });

  await browser.close();
}

inspectDiamondMesh().catch(console.error);
