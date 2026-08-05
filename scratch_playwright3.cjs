const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
  page.on('pageerror', err => console.log('BROWSER PAGE ERROR:', err.message));
  
  try {
    console.log("Navigating to login...");
    await page.goto('http://localhost:5173/login');
    
    console.log("Filling form...");
    await page.fill('#universityCode', 'UPES');
    await page.fill('#email', 'upes@gmail.com');
    await page.fill('#password', 'zai827--');
    await page.click('button[type="submit"]');
    
    console.log("Waiting for navigation to admin...");
    await page.waitForURL('**/admin/**');
    
    console.log("Navigating to builder...");
    await page.goto('http://localhost:5173/admin/question-papers/3/build', { timeout: 10000 });
    await page.waitForTimeout(3000);
    
    console.log("URL IS:", page.url());
    const bodyText = await page.evaluate(() => document.body.innerText);
    console.log("BODY TEXT IS:", bodyText ? bodyText.substring(0, 200) : "<EMPTY BODY>");
    
    // Check if #root is empty
    const rootHTML = await page.evaluate(() => document.getElementById('root').innerHTML);
    console.log("ROOT HTML LENGTH:", rootHTML.length);
    if (rootHTML.length < 100) console.log("ROOT HTML IS:", rootHTML);
    
  } catch (e) {
    console.log('Playwright error:', e.message);
  }
  await browser.close();
})();
