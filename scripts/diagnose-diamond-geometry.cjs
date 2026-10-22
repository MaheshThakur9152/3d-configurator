const fs = require('fs');
const path = require('path');
const THREE = require('three');
const { GLTFLoader } = require('three/examples/jsm/loaders/GLTFLoader.js');
const { DRACOLoader } = require('three/examples/jsm/loaders/DRACOLoader.js');

async function inspectGlb(filePath) {
  console.log(`\n========================================`);
  console.log(`Inspecting: ${filePath}`);
  console.log(`========================================`);

  const buffer = fs.readFileSync(filePath);
  const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);

  const loader = new GLTFLoader();
  return new Promise((resolve) => {
    loader.parse(arrayBuffer, '', (gltf) => {
      const scene = gltf.scene;
      scene.traverse((child) => {
        if (child.isMesh) {
          const mesh = child;
          const geo = mesh.geometry;
          const pos = geo.attributes.position;
          const norm = geo.attributes.normal;
          const idx = geo.index;
          const triCount = idx ? idx.count / 3 : pos.count / 3;

          geo.computeBoundingBox();
          const bb = geo.boundingBox;
          const size = new THREE.Vector3();
          bb.getSize(size);

          console.log(`\nMesh: "${mesh.name}"`);
          console.log(`- Material: "${mesh.material?.name}" (${mesh.material?.type})`);
          console.log(`- Triangles: ${triCount}, Vertices: ${pos.count}`);
          console.log(`- Indexed: ${!!idx}, Normals: ${!!norm}`);
          console.log(`- Dimensions (X, Y, Z): ${size.x.toFixed(4)}, ${size.y.toFixed(4)}, ${size.z.toFixed(4)}`);
          console.log(`- Center: [${((bb.min.x + bb.max.x)/2).toFixed(4)}, ${((bb.min.y + bb.max.y)/2).toFixed(4)}, ${((bb.min.z + bb.max.z)/2).toFixed(4)}]`);

          // Inspect normal vectors
          if (norm) {
            const upNormals = [];
            for (let i = 0; i < norm.count; i++) {
              const ny = norm.getY(i);
              if (ny > 0.8) upNormals.push(i);
            }
            console.log(`- Vertices with Normal Y > 0.8: ${upNormals.length} / ${norm.count}`);
          }
        }
      });
      resolve();
    }, (err) => console.error('Parse error:', err));
  });
}

(async () => {
  await inspectGlb('public/assets/models/hd_oval_10.glb');
  await inspectGlb('docs/ring-p25696.glb');
})();
