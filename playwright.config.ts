import { defineConfig, devices } from '@playwright/test';
import 'dotenv/config';
import type { ReportPortalConfig } from '@reportportal/agent-js-playwright/build/models';

/**
 * See https://playwright.dev/docs/test-configuration.
 */

const RPconfig: ReportPortalConfig = {
	apiKey: process.env.RP_API_KEY!,
	endpoint: process.env.RP_URL ?? 'https://jamf.reportportal.io/api/v1',
	project: process.env.RP_PROJECT ?? 'jamf_capabilities',
	launch: 'blueprint-test',
	description: 'Playwright blueprint-tests',
	includeTestSteps: true,
};

export default defineConfig({
	testDir: './tests',
	/* Run tests in files in parallel */
	fullyParallel: true,
	/* Fail the build on CI if you accidentally left test.only in the source code. */
	forbidOnly: !!process.env.CI,
	/* Retry on CI only */
	retries: process.env.CI ? 2 : 0,
	/* Opt out of parallel tests on CI. */
	workers: process.env.CI ? 3 : undefined,
	/* Reporter to use. See https://playwright.dev/docs/test-reporters */
	reporter: [
		['html', { open: 'never' }],
		[process.env.CI ? 'dot' : 'list'],
		...(process.env.CI
			? ([
					['@reportportal/agent-js-playwright', RPconfig],
					['json', { outputFile: process.env.PLAYWRIGHT_JSON_OUTPUT_NAME ?? 'result/result.json' }],
				] as const)
			: []),
		...(process.env.GITHUB_ACTIONS ? ([['github']] as const) : []),
	],
	/* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
	use: {
		/* Base URL to use in actions like `await page.goto('/')`. */
		// baseURL: 'http://127.0.0.1:3000',

		/* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
		trace: 'retain-on-failure',
		screenshot: 'on',
		video: 'on-first-retry',
		actionTimeout: 10_000,
		navigationTimeout: 15_000,
		viewport: { width: 1400, height: 900 },
	},
	/* Timeout for each test */
	timeout: 2 * 60 * 1000,

	/* Configure projects for major browsers */
	projects: [
		{
			name: 'chromium',
			use: {
				...devices['Desktop Chrome'],
				viewport: { width: 1400, height: 900 },
			},
		},
		{
			name: 'firefox',
			use: {
				...devices['Desktop Firefox'],
				viewport: { width: 1400, height: 900 },
				launchOptions: {
					firefoxUserPrefs: {
						'network.http.fast-fallback-to-IPv4': false,
					},
				},
			},
		},
		{
			name: 'webkit',
			use: {
				...devices['Desktop Safari'],
				viewport: { width: 1400, height: 900 },
			},
		},
	],
});
