const fs = require('fs');
const path = require('path');

const d = JSON.parse(fs.readFileSync('inspection/demo-project.json'));
const eternityAssets = (d.assets || []).filter(a => a.type === 'eternity' || a.tabKeys?.includes('tab3'));

async function downloadEternity() {
  for (const a of eternityAssets) {
    if (a.ijewelDriveThumbnailUrl) {
      const filename = path.basename(a.ijewelDriveThumbnailUrl.split('?')[0]);
      const dest = path.join(__dirname, 'public/assets/thumbnails/eternity', filename);
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      try {
        const res = await fetch(a.ijewelDriveThumbnailUrl);
        if (res.ok) {
          const buf = await res.arrayBuffer();
          fs.writeFileSync(dest, Buffer.from(buf));
          console.log(`Saved eternity thumb: ${filename}`);
        }
      } catch (e) {
        console.error(e.message);
      }
    }
  }
}

downloadEternity();
