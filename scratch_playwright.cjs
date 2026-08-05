const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
  page.on('pageerror', err => console.log('BROWSER PAGE ERROR:', err.message));
  try {
    await page.goto('http://localhost:5173/admin/question-papers/3/build', { timeout: 10000 });
    await page.waitForTimeout(2000); // Wait to see if error triggers
  } catch (e) {
    console.log('Playwright error:', e.message);
  }
  await browser.close();
})();
