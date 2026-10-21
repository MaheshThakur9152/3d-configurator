const fs = require('fs');

const html = fs.readFileSync('inspection/main-structure.html', 'utf8');
const viewerEnd = html.indexOf('</div>', html.indexOf('class="group absolute bottom-4 right-4'));
console.log('Right panel start:');
console.log(html.slice(viewerEnd, viewerEnd + 1200));
