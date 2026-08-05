const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    await page.goto('http://localhost:5173/login');
    await page.fill('#universityCode', 'UPES');
    await page.fill('#email', 'upes@gmail.com');
    await page.fill('#password', 'zai827--');
    await page.click('button[type="submit"]');
    
    await page.waitForURL('**/admin/**');
    await page.goto('http://localhost:5173/admin/question-papers/3/build', { timeout: 10000 });
    await page.waitForTimeout(3000);
    
    await page.screenshot({ path: 'builder_screenshot.png' });
    console.log("Screenshot saved to builder_screenshot.png");
  } catch (e) {
    console.log('Playwright error:', e.message);
  }
  await browser.close();
})();
