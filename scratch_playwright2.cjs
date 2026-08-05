const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
  page.on('pageerror', err => console.log('BROWSER PAGE ERROR:', err.message));
  page.on('requestfailed', request => console.log('REQUEST FAILED:', request.url(), request.failure().errorText));
  
  try {
    await page.goto('http://localhost:5173/admin/question-papers/3/build', { timeout: 15000 });
    await page.waitForTimeout(3000);
    const content = await page.content();
    console.log("URL IS:", page.url());
    console.log("HTML CONTENT:", content);
  } catch (e) {
    console.log('Playwright error:', e.message);
  }
  await browser.close();
})();
