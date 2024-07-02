import { test, expect } from '@playwright/test';

const baseUrl = 'https://blueprints.stage-mfe.jamf.io/?clusterUrl=https://tyk.sbox.ocean.jamf.build';

test('has title', async ({ page }) => {
	await page.goto(baseUrl);

	await expect(page).toHaveTitle('Blueprints');
});
