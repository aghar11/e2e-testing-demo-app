const { chromium } = require('playwright');

// Import modular test functions
const openGoogle = require('./tests/openGoogle');
const searchNHL = require('./tests/searchNHL');
const searchNFL = require('./tests/searchNFL');
const searchNBA = require('./tests/searchNBA');
const createUser = require('./tests/createUser');

const testMap = {
    openGoogle,
    searchNHL,
    searchNFL,
    searchNBA,
    createUser,
}

async function runTest(testName) {
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();

    const testFunction = testMap[testName];

    if (testFunction) {
        await testFunction(page);
        console.log(`Test ${testName} completed successfully!`)
    } else {
        console.log(`Test ${testName} not found.`);
    }

    await browser.close();
}

module.exports = { runTest };
