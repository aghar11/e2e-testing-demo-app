const fs = require('fs/promises');
const path = require('path');

const modifyGeneratedTest = async (filePath, testName) => {
    var content = await fs.readFile(filePath, 'utf8');

    // Remove the IIFE wrapper (first & last lines)
    content = content.replace(/^\(\s*async\s*\(\)\s*=>\s*\{\s*/, '');
    content = content.replace(/\}\)\(\);?\s*$/, '');

    // Wrap content in an exportable function
    content = `
        const { chromium } = require('playwright');

        async function ${testName}() {
            ${content}
        }

        module.exports = ${testName};
    `;

    fs.writeFile(filePath, content, 'utf8', (err) => {
        if (err) throw err;
        console.log('The file has been saved!');
    });
}

module.exports = modifyGeneratedTest;
