const fs = require('fs');

const sidebarHtml = fs.readFileSync('inspection/sidebar.html', 'utf8');

// Let's find all section titles and headers
const regex = /<span[^>]*style="color: var\(--config-text-primary\);"[^>]*>([^<]+)<\/span>/g;
let match;
console.log('Sections found:');
while ((match = regex.exec(sidebarHtml)) !== null) {
  console.log(' - ' + match[1]);
}

// Let's also find all tab buttons
const tabRegex = /<button[^>]*role="tab"[^>]*>([\s\S]*?)<\/button>/g;
while ((match = tabRegex.exec(sidebarHtml)) !== null) {
  console.log('Tab:', match[1].replace(/<[^>]+>/g, '').trim());
}

// Let's search for buttons inside sidebar
const btnRegex = /<button[^>]*>([\s\S]*?)<\/button>/g;
const allBtns = [];
while ((match = btnRegex.exec(sidebarHtml)) !== null) {
  const text = match[1].replace(/<[^>]+>/g, '').trim();
  if (text) allBtns.push(text);
}
console.log('Buttons with text:', allBtns);
