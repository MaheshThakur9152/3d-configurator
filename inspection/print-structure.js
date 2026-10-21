const fs = require('fs');

const html = fs.readFileSync('inspection/main-structure.html', 'utf8');

// Viewer container
const viewerMatch = html.match(/<div class="relative w-full md:w-\[70%\][^>]*>([\s\S]*?)<\/div>\s*<div class="flex-1/);
if (viewerMatch) {
  console.log('--- VIEWER CONTAINER ---');
  console.log(viewerMatch[0].slice(0, 1000));
}

// Right panel container
const panelIdx = html.indexOf('<div class="flex-1');
console.log('--- RIGHT PANEL HEADER ---');
console.log(html.slice(panelIdx, panelIdx + 1500));
