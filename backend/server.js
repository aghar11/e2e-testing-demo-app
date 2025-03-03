const fs = require('fs');
const path = require('path');
const express = require('express');
const http = require('http');
const cors = require('cors');
const { chromium } = require('playwright');
const { exec } = require('child_process');

const app = express();
const PORT = 8000;

// Path to the tests directory
const TESTS_DIR = path.join(__dirname, "./tests");
var testsList = [];

// App setup
app.use(cors());
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

// SSE Endpoint
app.get('/events', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    
    const watcher = fs.watch(TESTS_DIR, (eventType, filename) => {
        const testName = filename.split('.')[0];
        if (eventType === 'rename' && filename.endsWith('.test.js') && !testsList.includes(testName)) {
            testsList.push(testName);
            res.write(`data: ${JSON.stringify({ testName: testName })}\n\n`);
        }
    });

    // Cleanup on disconnect
    req.on('close', () => watcher.close());
});

// GET Request: /load-tests
app.get('/load-tests', async (req, res) => {
    fs.readdir(TESTS_DIR, (err, files) => {
        if (err) {
            res.status(500).json({ error: `Failed to load test cases` });
        }

        testsList = files.filter(file => file.endsWith('.test.js'))
        testsList.forEach(function(fileName, index) {
            testsList[index] = fileName.split('.')[0];
        });
        res.json({ tests: testsList });
    });
});

// GET Request: /run-test
app.get('/run-test', async (req, res) => {
    const { flow } = req.query; // Expecting a comma-separated list of function names
    const testFlow = flow ? flow.split(',') : [];

    const browser = await chromium.launch({ headless: false });
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

// POST Request: /start-codegen
app.post('/start-codegen', (req, res) => {
    const url = req.body.url || null;
    const outputFilePath = req.body.name ? `./tests/${req.body.name}.test.js` : `./tests/${new Date().toISOString()}.test.js`
    const command = url ? `npx playwright codegen ${url} --target=javascript --output=${outputFilePath}` : `npx playwright codegen --target=javascript --output=${outputFilePath}` ;

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error starting codegen: ${error.message}`)
            return res.status(500).json({ message: 'Failed to start Playwright Codegen' });
        }
    });

    res.json({ message: 'Playwright Codegen started!' });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));