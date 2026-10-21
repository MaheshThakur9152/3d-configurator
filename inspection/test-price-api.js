const { chromium } = require('playwright-core');

async function testPriceApi() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const page = browser.contexts()[0].pages().find(p => p.url().includes('alloyum.com/demo'));
  
  page.on('request', req => {
    if (req.url().includes('price')) {
      console.log('Price request URL:', req.url());
      console.log('Price request body:', req.postData());
    }
  });

  page.on('response', async res => {
    if (res.url().includes('price')) {
      console.log('Price response status:', res.status());
      try {
        console.log('Price response json:', await res.json());
      } catch (e) {
        console.log('Price response text:', await res.text());
      }
    }
  });

  // Click yellow gold to trigger price update
  console.log('Clicking yellow gold...');
  await page.evaluate(() => {
    const imgs = Array.from(document.querySelectorAll('img')).filter(img => img.src.includes('yellow-gold'));
    if (imgs.length > 0) imgs[0].click();
  });

  await page.waitForTimeout(3000);

  // Click white gold
  console.log('Clicking white gold...');
  await page.evaluate(() => {
    const imgs = Array.from(document.querySelectorAll('img')).filter(img => img.src.includes('white-gold'));
    if (imgs.length > 0) imgs[0].click();
  });

  await page.waitForTimeout(3000);
  await browser.close();
}

testPriceApi().catch(console.error);
