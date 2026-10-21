const fs = require('fs');

const html = fs.readFileSync('inspection/page.html', 'utf8');
console.log('HTML length:', html.length);

const scripts = html.match(/<script[^>]*src=["']([^"']+)["'][^>]*>/g) || [];
console.log('Scripts:', scripts);

const links = html.match(/<link[^>]*href=["']([^"']+)["'][^>]*>/g) || [];
console.log('Links:', links);

// Let's check title and meta
const titleMatch = html.match(/<title>([^<]+)<\/title>/);
console.log('Title:', titleMatch ? titleMatch[1] : 'none');

// Let's inspect CSS files
const cssFiles = (html.match(/href=["']([^"']+\.css[^"']*)["']/g) || []).map(s => s.slice(6, -1));
console.log('CSS files:', cssFiles);
