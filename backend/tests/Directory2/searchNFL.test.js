const searchNFL = async (page) => {
    console.log('Searching for NFL...');
    await page.waitForTimeout(5000);
    await page.waitForSelector('textarea[name="q"]');
    await page.locator('textarea[name="q"]').fill('NFL');
    await page.waitForTimeout(2000);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(2000);
};

module.exports = searchNFL;
