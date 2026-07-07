const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto('http://localhost:5173/admin/results', { waitUntil: 'networkidle0' });
  
  await page.screenshot({ path: 'debug_screenshot.png' });
  console.log('Screenshot saved to debug_screenshot.png');
  
  await browser.close();
})();
