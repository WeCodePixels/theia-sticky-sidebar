import {test} from '@playwright/test';

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
