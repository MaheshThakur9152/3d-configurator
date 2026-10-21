const fs = require('fs');
const THREE = require('three');
const { GLTFLoader } = require('three/examples/jsm/loaders/GLTFLoader.js');
const { DRACOLoader } = require('three/examples/jsm/loaders/DRACOLoader.js');

// Inspect mesh 21 vertices and faces
const data = fs.readFileSync('public/assets/models/hd_oval_10.glb');
const arrayBuffer = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);

const loader = new GLTFLoader();
loader.parse(arrayBuffer, '', (gltf) => {
  let gemMesh = null;
  gltf.scene.traverse((child) => {
    if (child.isMesh && (child.material?.name === 'Gem 01' || child.name === 'mesh_21')) {
      gemMesh = child;
    }
  });

  if (gemMesh) {
    const geo = gemMesh.geometry;
    console.log('Gem mesh found:', gemMesh.name);
    console.log('Vertex count:', geo.attributes.position.count);
    console.log('Index count:', geo.index ? geo.index.count : 'no index');
    console.log('Has normals:', !!geo.attributes.normal);
    console.log('Has uvs:', !!geo.attributes.uv);
    geo.computeBoundingBox();
    console.log('BoundingBox min:', geo.boundingBox.min);
    console.log('BoundingBox max:', geo.boundingBox.max);
    console.log('Size:', {
      x: geo.boundingBox.max.x - geo.boundingBox.min.x,
      y: geo.boundingBox.max.y - geo.boundingBox.min.y,
      z: geo.boundingBox.max.z - geo.boundingBox.min.z,
    });
  } else {
    console.log('Gem mesh not found');
  }
}, (err) => console.error(err));
