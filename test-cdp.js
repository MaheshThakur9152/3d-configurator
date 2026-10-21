const { chromium } = require('playwright-core');

async function testCDP() {
  try {
    const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
    const contexts = browser.contexts();
    console.log('Connected to CDP! Context count:', contexts.length);
    for (const context of contexts) {
      const pages = context.pages();
      console.log('Pages count:', pages.length);
      for (const page of pages) {
        console.log('Page URL:', page.url(), '| Title:', await page.title());
      }
    }
  } catch (err) {
    console.error('CDP connection error:', err);
  }
}

testCDP();
