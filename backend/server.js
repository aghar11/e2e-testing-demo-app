const express = require('express');
const cors = require('cors');
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const TESTS_DIR = path.join(__dirname, './tests');

const app = express();
app.use(cors());

// HELPER FUNCTIONS
const getDirectoryStructure = (dir = TESTS_DIR) => {
    const result = [];

    fs.readdirSync(dir, { withFileTypes: true }).forEach((entry) => {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
            const children = getDirectoryStructure(fullPath);
            result.push( { id: fullPath, label: entry.name, children });
        } else if (entry.isFile() && entry.name.endsWith('.test.js')) {
            result.push({ id: fullPath, label: entry.name.replace('.test.js', '')})
        }
    });

    return result;
};


// GET Request: /load-tests
app.get('/load-tests', async (req, res) => {
    try {
        const testStructure = getDirectoryStructure();
        console.log(testStructure);
        res.json(testStructure);
    } catch (error) {
        console.error('Error reading test structure:', error);
        res.status(500).json({ message: 'Failed to load test structure' });
    }
});

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