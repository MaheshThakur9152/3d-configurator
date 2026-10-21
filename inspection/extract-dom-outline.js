const fs = require('fs');

const html = fs.readFileSync('inspection/page.html', 'utf8');
const start = html.indexOf('<div class="flex flex-col md:flex-row');
if (start !== -1) {
  fs.writeFileSync('inspection/main-structure.html', html.slice(start));
  console.log('Saved main-structure.html, length:', html.length - start);
} else {
  console.log('Not found');
}
