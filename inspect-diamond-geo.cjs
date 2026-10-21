const fs = require('fs');

const buffer = fs.readFileSync('public/assets/models/hd_oval_10.glb');
const jsonLength = buffer.readUInt32LE(12);
const gltf = JSON.parse(buffer.slice(20, 20 + jsonLength).toString('utf8'));

console.log('Meshes count in hd_oval_10:', gltf.meshes.length);
gltf.meshes.forEach((m, idx) => {
  const p = m.primitives[0];
  const matIdx = p.material;
  const mat = matIdx !== undefined ? gltf.materials[matIdx] : null;
  console.log(`Mesh ${idx} (${m.name}): mat=${mat ? mat.name : 'none'}, targets=${p.attributes ? Object.keys(p.attributes) : ''}`);
});

console.log('\nMaterials in hd_oval_10:');
gltf.materials.forEach((mat, idx) => {
  console.log(`Mat ${idx} (${mat.name}):`, JSON.stringify(mat.pbrMetallicRoughness || mat.extensions || {}));
});
