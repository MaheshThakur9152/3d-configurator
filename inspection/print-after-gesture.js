const fs = require('fs');

const html = fs.readFileSync('inspection/main-structure.html', 'utf8');
const gestureEnd = html.indexOf('</svg></div></div>', html.indexOf('gesture'));
console.log('After gesture:');
const afterGesture = gestureEnd !== -1 ? gestureEnd : html.indexOf('Your Engagement Ring') - 300;
console.log(html.slice(afterGesture, afterGesture + 1000));
