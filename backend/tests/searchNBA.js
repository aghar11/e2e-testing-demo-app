const searchNBA = async (page) => {
    console.log('Searching for NHL...');
    await page.waitForSelector('textarea[name="q"]');
    await page.locator('textarea[name="q"]').fill('NBA');
    await page.waitForTimeout(2000);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(2000);
};

module.exports = searchNBA;
