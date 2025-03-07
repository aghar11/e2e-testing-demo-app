const express = require('express');
const cors = require('cors');
const { chromium } = require('playwright');
const openGoogle = require('./tests/openGoogle');
const searchNHL= require('./tests/searchNHL');
const searchNBA = require('./tests/searchNBA');
const searchNFL = require('./tests/searchNFL');

const app = express();
app.use(cors());

const testFunctions = {
    openGoogle,
    searchNHL,
    searchNBA,
    searchNFL,
};

// GET Request: /run-test
app.get('/run-test', async (req, res) => {
    const { flow } = req.query; // Expecting a comma-separated list of function names
    const testFlow = flow ? flow.split(',') : [];

    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    try {
        for (const testName of testFlow) {
            if (testFunctions[testName]) {
                await testFunctions[testName](page);
            } else {
                console.warn(`Unknown test case: ${testName}`);
            }
        }
        res.send('Test flow executed successfully!');
    } catch (e) {
        console.error('Error during test execution:', e);
        res.status(500).send('Failed to execute test flow.');
    } finally {
        await browser.close();
    }
});

app.listen(8000, () => console.log('Server running on port 8000'));