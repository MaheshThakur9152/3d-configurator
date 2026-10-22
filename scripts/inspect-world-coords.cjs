const { chromium } = require('playwright-core');

async function inspectWorldCoords() {
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe',
    headless: true,
    args: ['--use-gl=angle', '--use-angle=d3d11', '--enable-webgl']
  });

  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('http://localhost:5173');
  await page.waitForTimeout(3000);

  const worldDetails = await page.evaluate(() => {
    const scene = window.__viewerScene;
    let mesh = null;
    scene.traverse((c) => {
      if (c.isMesh && c.name === 'mesh_21') mesh = c;
    });
    if (!mesh) return null;

    mesh.updateMatrixWorld(true);
    const pos = mesh.geometry.attributes.position;
    const norm = mesh.geometry.attributes.normal;

    // Use three from scene
    const e = mesh.matrixWorld.elements;
    // transform vector by matrix 4x4
    const transformPoint = (x, y, z) => {
      const w = e[3]*x + e[7]*y + e[11]*z + e[15];
      return [
        (e[0]*x + e[4]*y + e[8]*z + e[12]) / w,
        (e[1]*x + e[5]*y + e[9]*z + e[13]) / w,
        (e[2]*x + e[6]*y + e[10]*z + e[14]) / w
      ];
    };
    // transform normal by 3x3
    const transformNorm = (nx, ny, nz) => {
      const vx = e[0]*nx + e[4]*ny + e[8]*nz;
      const vy = e[1]*nx + e[5]*ny + e[9]*nz;
      const vz = e[2]*nx + e[6]*ny + e[10]*nz;
      const len = Math.hypot(vx, vy, vz) || 1;
      return [vx / len, vy / len, vz / len];
    };

    const tableVertices = [];
    for (let i = 0; i < 5; i++) {
      const wp = transformPoint(pos.getX(i), pos.getY(i), pos.getZ(i));
      const wn = transformNorm(norm.getX(i), norm.getY(i), norm.getZ(i));
      tableVertices.push({
        worldPos: wp.map(n => n.toFixed(4)),
        worldNorm: wn.map(n => n.toFixed(4)),
      });
    }

    let minZIndex = 0;
    let minZVal = Infinity;
    for (let i = 0; i < pos.count; i++) {
      if (pos.getZ(i) < minZVal) {
        minZVal = pos.getZ(i);
        minZIndex = i;
      }
    }
    const culetWp = transformPoint(pos.getX(minZIndex), pos.getY(minZIndex), pos.getZ(minZIndex));
    const culetWn = transformNorm(norm.getX(minZIndex), norm.getY(minZIndex), norm.getZ(minZIndex));

    return {
      tableVertices,
      culet: {
        worldPos: culetWp.map(n => n.toFixed(4)),
        worldNorm: culetWn.map(n => n.toFixed(4)),
      }
    };
  });

  console.dir(worldDetails, { depth: null });
  await browser.close();
}

inspectWorldCoords().catch(console.error);
