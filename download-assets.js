const fs = require('fs');
const path = require('path');

const assetsToDownload = [
  // Logo
  { url: 'https://alloyum.com/logo.png', dest: 'public/logo.png' },
  { url: 'https://alloyum.com/logo.png', dest: 'public/assets/logo.png' },

  // Metals
  { url: 'https://alloyum.com/icons/metals/yellow-gold.png', dest: 'public/assets/icons/metals/yellow-gold.png' },
  { url: 'https://alloyum.com/icons/metals/white-gold.png', dest: 'public/assets/icons/metals/white-gold.png' },
  { url: 'https://alloyum.com/icons/metals/rose-gold.png', dest: 'public/assets/icons/metals/rose-gold.png' },

  // Shapes
  { url: 'https://alloyum.com/icons/shapes/cushion.svg', dest: 'public/assets/icons/shapes/cushion.svg' },
  { url: 'https://alloyum.com/icons/shapes/emerald.svg', dest: 'public/assets/icons/shapes/emerald.svg' },
  { url: 'https://alloyum.com/icons/shapes/oval.svg', dest: 'public/assets/icons/shapes/oval.svg' },
  { url: 'https://alloyum.com/icons/shapes/pear.svg', dest: 'public/assets/icons/shapes/pear.svg' },
  { url: 'https://alloyum.com/icons/shapes/round.svg', dest: 'public/assets/icons/shapes/round.svg' },

  // Head styles
  { url: 'https://alloyum.com/icons/head_style/halo.svg', dest: 'public/assets/icons/head_style/halo.svg' },
  { url: 'https://alloyum.com/icons/head_style/hidden_halo.svg', dest: 'public/assets/icons/head_style/hidden_halo.svg' },
  { url: 'https://alloyum.com/icons/head_style/secret_hidden_halo.svg', dest: 'public/assets/icons/head_style/secret_hidden_halo.svg' },
  { url: 'https://alloyum.com/icons/head_style/4_prongs.svg', dest: 'public/assets/icons/head_style/4_prongs.svg' },
  { url: 'https://alloyum.com/icons/head_style/6_prongs.svg', dest: 'public/assets/icons/head_style/6_prongs.svg' },
  { url: 'https://alloyum.com/icons/head_style/secret_bazel.svg', dest: 'public/assets/icons/head_style/secret_bazel.svg' },
  { url: 'https://alloyum.com/icons/head_style/tulip.svg', dest: 'public/assets/icons/head_style/tulip.svg' },

  // Gemstones
  { url: 'https://alloyum.com/icons/gemstones/diamond.svg', dest: 'public/assets/icons/gemstones/diamond.svg' },
  { url: 'https://alloyum.com/icons/gemstones/blue_sapphire.svg', dest: 'public/assets/icons/gemstones/blue_sapphire.svg' },
  { url: 'https://alloyum.com/icons/gemstones/ruby.svg', dest: 'public/assets/icons/gemstones/ruby.svg' },
  { url: 'https://alloyum.com/icons/gemstones/emerald.svg', dest: 'public/assets/icons/gemstones/emerald.svg' },
  { url: 'https://alloyum.com/icons/gemstones/aquamarine.svg', dest: 'public/assets/icons/gemstones/aquamarine.svg' },
  { url: 'https://alloyum.com/icons/gemstones/pink_diamond.svg', dest: 'public/assets/icons/gemstones/pink_diamond.svg' },
  { url: 'https://alloyum.com/icons/gemstones/yellow_sapphire.svg', dest: 'public/assets/icons/gemstones/yellow_sapphire.svg' },

  // Carats
  { url: 'https://alloyum.com/icons/carats/0.5.svg', dest: 'public/assets/icons/carats/0.5.svg' },
  { url: 'https://alloyum.com/icons/carats/1.svg', dest: 'public/assets/icons/carats/1.svg' },
  { url: 'https://alloyum.com/icons/carats/2.svg', dest: 'public/assets/icons/carats/2.svg' },

  // Shank Thumbnails
  { url: 'https://drive-weur-1.ijewel3d.com/files/sh_pv_1_y_96c888c667.png?h=ijewel3d.com', dest: 'public/assets/thumbnails/sh_pv_1.png' },
  { url: 'https://drive-weur-1.ijewel3d.com/files/sh_3_pv_y_da7fd8fdec.png?h=ijewel3d.com', dest: 'public/assets/thumbnails/sh_3_pv.png' },
  { url: 'https://drive-weur-1.ijewel3d.com/files/sh_f_2_y_c176961344.png?h=ijewel3d.com', dest: 'public/assets/thumbnails/sh_f_2.png' },
  { url: 'https://drive-weur-1.ijewel3d.com/files/sh_8_d_y_e31d8dac2e.png?h=ijewel3d.com', dest: 'public/assets/thumbnails/sh_8_d.png' },
  { url: 'https://drive-weur-1.ijewel3d.com/files/sh_ch_2_y_dcd0fd0692.png?h=ijewel3d.com', dest: 'public/assets/thumbnails/sh_ch_2.png' },
  { url: 'https://drive-weur-1.ijewel3d.com/files/sh_pv_2_y_2aca262a9f.png?h=ijewel3d.com', dest: 'public/assets/thumbnails/sh_pv_2.png' },
  { url: 'https://drive-weur-1.ijewel3d.com/files/sh_pv_3_y_8fc25a4c76.png?h=ijewel3d.com', dest: 'public/assets/thumbnails/sh_pv_3.png' },
  { url: 'https://drive-weur-1.ijewel3d.com/files/sh_pv_4_y_3e82c9bd70.png?h=ijewel3d.com', dest: 'public/assets/thumbnails/sh_pv_4.png' },
  { url: 'https://drive-weur-1.ijewel3d.com/files/sh_pl_2_y_2328ce72e7.png?h=ijewel3d.com', dest: 'public/assets/thumbnails/sh_pl_2.png' },
  { url: 'https://drive-weur-1.ijewel3d.com/files/sh_pl_3_y_768b9ea224.png?h=ijewel3d.com', dest: 'public/assets/thumbnails/sh_pl_3.png' },
  { url: 'https://drive-weur-1.ijewel3d.com/files/sh_pl_4_y_965a228dc1.png?h=ijewel3d.com', dest: 'public/assets/thumbnails/sh_pl_4.png' },
  { url: 'https://drive-weur-1.ijewel3d.com/files/sh_pl_5_y_2db5949b30.png?h=ijewel3d.com', dest: 'public/assets/thumbnails/sh_pl_5.png' },
  { url: 'https://drive-weur-1.ijewel3d.com/files/sh_u_2_y_f54e4d2a78.png?h=ijewel3d.com', dest: 'public/assets/thumbnails/sh_u_2.png' },

  // 3D Models
  { url: 'https://drive-weur-1.ijewel3d.com/files/sh_pave_1_e1f34114c3.glb?h=ijewel3d.com', dest: 'public/assets/models/sh_pave_1.glb' },
  { url: 'https://drive-weur-1.ijewel3d.com/files/hd_hhs_oval_10_b4e0d59485.glb?h=ijewel3d.com', dest: 'public/assets/models/hd_oval_10.glb' },
  { url: 'https://drive-weur-1.ijewel3d.com/files/et_plain_03_5f3ab7d528.glb?h=ijewel3d.com', dest: 'public/assets/models/et_plain_03.glb' },
  { url: 'https://drive-weur-1.ijewel3d.com/files/et_9_diamods_c45f004d46.glb?h=ijewel3d.com', dest: 'public/assets/models/et_9_diamods.glb' },
  { url: 'https://drive-weur-1.ijewel3d.com/files/et_channel_1_b25fb90a87.glb?h=ijewel3d.com', dest: 'public/assets/models/et_channel_1.glb' },
  { url: 'https://drive-weur-1.ijewel3d.com/files/et_diamond_1_6553467415.glb?h=ijewel3d.com', dest: 'public/assets/models/et_diamond_1.glb' },
];

async function downloadAll() {
  for (const item of assetsToDownload) {
    const fullPath = path.join(__dirname, item.dest);
    const dir = path.dirname(fullPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    try {
      console.log(`Downloading: ${item.url} -> ${item.dest}`);
      const res = await fetch(item.url);
      if (!res.ok) {
        console.error(`Failed ${item.url}: ${res.statusText}`);
        continue;
      }
      const buf = await res.arrayBuffer();
      fs.writeFileSync(fullPath, Buffer.from(buf));
      console.log(`Saved ${item.dest} (${buf.byteLength} bytes)`);
    } catch (err) {
      console.error(`Error downloading ${item.url}:`, err.message);
    }
  }
}

downloadAll();
