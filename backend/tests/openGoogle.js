const openGoogle = async (page) => {
    console.log(`Opening Google...`)
    await page.goto('https://www.google.com');
    await page.waitForTimeout(2000);
}

module.exports = openGoogle;