const fs = require('fs');
const path = require('path');
const express = require('express');
const http = require('http');
const cors = require('cors');
const { chromium } = require('playwright');
const { exec } = require('child_process');
const util = require('util');

const app = express();
const PORT = 8000;

// Path to the tests directory
const TESTS_DIR = path.join(__dirname, "./tests");
let testFunctions = {};

// App setup
app.use(cors());
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

// Helper functions
const modifyGeneratedTest = require('./helpers/modifyGeneratedTestCases');

// SSE Endpoint
app.get('/events', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    
    const watcher = fs.watch(TESTS_DIR, async (eventType, filename) => {
        const testName = filename.split('.')[0];
        const testPath = path.join(TESTS_DIR, filename)
        if (eventType === 'rename' && filename.endsWith('.test.js') && !Object.keys(testFunctions).includes(testName)) {
            const module = await import(testPath + `?cachebust=${Date.now()}`); 
            testFunctions[testName] = module.default || module;
            res.write(`data: ${JSON.stringify({ testName: testName })}\n\n`);
        }
    });

    // Cleanup on disconnect
    req.on('close', () => watcher.close());
});

// GET Request: /load-tests
app.get('/load-tests', async (req, res) => {
    testFunctions = {}; // Reset the test map

    const files = fs.readdirSync(TESTS_DIR);
    const importPromises = files
        .filter(file => file.endsWith('.test.js'))
        .map(async file => {
            const testName = file.split('.')[0];
            const testPath = `file://${path.join(TESTS_DIR, file)}`;

            try {
                const module = await import(testPath + `?cachebust=${Date.now()}`); 
                testFunctions[testName] = module.default || module;
            } catch (error) {
                console.error(`Error loading test case: ${testName}`, error);
            }
        });

    await Promise.all(importPromises); // Wait for all tests to load
    console.log('Loaded test cases!');
    res.json({ tests: Object.keys(testFunctions) });
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

// Promisify exec to return a promise
const execPromise = util.promisify(exec);

// POST Request: /start-codegen
app.post('/start-codegen', async (req, res) => {
    const url = req.body.url || null;
    const testName = req.body.name || new Date().toISOString();
    const fileName = `${testName}.test.ts`;
    const outputFilePath = path.join(TESTS_DIR, fileName)
    const command = url ? `npx playwright codegen ${url} --output=${outputFilePath}` : `npx playwright codegen --output=${outputFilePath}` ;

    const { stdout, stderr } = await execPromise(command);

    //await modifyGeneratedTest(outputFilePath, testName);

    res.json({ message: 'Test case generated successfully!' });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));