const { chromium } = require('playwright-core');

async function test() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const page = browser.contexts()[0].pages().find(p => p.url().includes('alloyum.com/demo'));
  
  const priceInfo = await page.evaluate(() => {
    const all = Array.from(document.querySelectorAll('*'));
    const priceEl = all.find(el => el.innerText && /^\$\s*[\d,]+$/.test(el.innerText.trim()));
    if (!priceEl) return null;
    const s = window.getComputedStyle(priceEl);
    return {
      text: priceEl.innerText.trim(),
      className: priceEl.className,
      computed: {
        fontSize: s.fontSize,
        fontWeight: s.fontWeight,
        fontFamily: s.fontFamily,
        color: s.color,
        margin: s.margin,
        padding: s.padding,
      }
    };
  });
  console.log('Price info:', priceInfo);
  await browser.close();
}
test();
