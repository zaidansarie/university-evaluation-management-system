const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  page.on('requestfailed', request => console.log('REQUEST FAILED:', request.url(), request.failure().errorText));

  console.log('Navigating to http://localhost:5173/admin/results...');
  await page.goto('http://localhost:5173/admin/results', { waitUntil: 'networkidle0' });
  
  const content = await page.content();
  console.log('Body length:', content.length);
  if (content.includes('Results Dashboard')) {
    console.log('SUCCESS: Dashboard text found in HTML.');
  } else {
    console.log('FAILED: Dashboard text not found in HTML.');
  }

  await browser.close();
})();
