import {test} from '@playwright/test';
import fs from 'fs';
import path from 'path';

const urls = [
    '3-columns',
    '4-columns',
    'bootstrap-v4',
    'foundation'
];

for (const url of urls) {
    test(`url scrolling on page "${url}"`, async ({page}) => {
        await page.goto('/examples/' + url + '.html');

        // Start the test.
        await page.getByRole('button', {name: 'Run'}).click();

        // If the test fails, an error will be thrown.
        page.on('pageerror', (error) => {
            throw new Error(`JavaScript error encountered: ${error.message}`);
        });

        // If the test succeeds, a global variable will be set.
        await page.waitForFunction(() => (window as any).testFinishedSuccessfully === true);
    });
}

test.afterEach(async ({page}) => {
    // Extract coverage data from the browser
    const coverage = await page.evaluate(() => (window as any).__coverage__);

    // Ensure directory exists
    const dir = '.nyc_output';
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }

    // Save coverage data with a unique filename for each test
    // This helps when running tests in parallel
    const id = `playwright-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    fs.writeFileSync(path.join(dir, `coverage-${id}.json`), JSON.stringify(coverage));
});
