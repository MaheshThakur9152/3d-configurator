const fs = require('fs');
const THREE = require('three');
const { GLTFLoader } = require('three/examples/jsm/loaders/GLTFLoader.js');
const { DRACOLoader } = require('three/examples/jsm/loaders/DRACOLoader.js');

// We can load GLTF in node with JSDOM or just inspect the JSON chunk of GLB!
const buffer = fs.readFileSync('public/assets/models/sh_pave_1.glb');
// In GLB, header is 12 bytes: magic (4), version (4), length (4)
// Chunk 0 is JSON: length (4), type (4), json bytes
const jsonLength = buffer.readUInt32LE(12);
const jsonBuffer = buffer.slice(20, 20 + jsonLength);
const gltf = JSON.parse(jsonBuffer.toString('utf8'));

console.log('Shank scenes:', gltf.scenes);
console.log('Shank nodes (first 5):', gltf.nodes.slice(0, 5));
