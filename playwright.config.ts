import {
	defineConfig,
	devices,
	type PlaywrightTestArgs,
	type PlaywrightTestOptions,
	type PlaywrightWorkerArgs,
	type PlaywrightWorkerOptions,
	type Project,
} from '@playwright/test';
import 'dotenv/config';
import type { Attribute, ReportPortalConfig } from '@reportportal/agent-js-playwright/build/models';
import { type TestOptions } from './tests/utils/utils';
import {
	type Environment,
	environments,
	type StandardEnvironment,
	standardEnvironmentTypes,
} from './tests/utils/environments';

/**
 * See https://playwright.dev/docs/test-configuration.
 */

const RPconfig: ReportPortalConfig = {
	apiKey: process.env.RP_API_KEY!,
	endpoint: process.env.RP_URL ?? 'https://jamf.reportportal.io/api/v2',
	project: process.env.RP_PROJECT ?? 'jamf_capabilities',
	launch: 'blueprint-test',
	description: 'Playwright blueprint-tests',
	includeTestSteps: true,
	attributes: (process.env.RP_ATTRIBUTES || '')
		.split(',')
		.map((part) => part.trim())
		.filter((part) => part.length > 0)
		.map((attr) => {
			const [key, value] = attr.split(':', 2);
			return { key, value: value! } satisfies Attribute;
		}),
};

const isRunningInCI = !!process.env.CI;

function tagsToGrep(tags: string[][]): RegExp {
	return new RegExp(
		tags
			.filter((group) => group.length !== 0)
			.map((group) => `(?=.*(?:${group.join('|')}))`)
			.join('')
	);
}

function* generateProjects(): Generator<Project<PlaywrightTestOptions & TestOptions>, void, unknown> {
	const browsers: {
		name: string;
		tags?: string[];
		use: Partial<PlaywrightTestArgs & PlaywrightTestOptions> & Partial<PlaywrightWorkerArgs & PlaywrightWorkerOptions>;
	}[] = [
		{
			name: 'Chrome',
			tags: ['@all-browsers', '@chrome'],
			use: {
				...devices['Desktop Chrome'],
				viewport: { width: 1400, height: 900 },
				...(isRunningInCI
					? {}
					: {
							permissions: ['local-network-access'],
						}),
			},
		},
		{
			name: 'Firefox',
			tags: ['@all-browsers', '@firefox'],
			use: {
				...devices['Desktop Firefox'],
				viewport: { width: 1400, height: 900 },
				...(isRunningInCI
					? {}
					: {
							launchOptions: {
								firefoxUserPrefs: {
									'network.http.fast-fallback-to-IPv4': false,
								},
							},
						}),
			},
		},
		{
			name: 'Safari',
			tags: ['@all-browsers', '@safari'],
			use: {
				...devices['Desktop Safari'],
				viewport: { width: 1400, height: 900 },
			},
		},
	];

	const populateCustomTemplates = !isRunningInCI;
	const customTemplates: {
		name: string;
		tags: string[];
		environment?: Environment;
	}[] = populateCustomTemplates
		? [
				{
					name: 'Jamf School',
					tags: ['@school'],
					environment: environments.custom?.school,
				},
				{
					name: 'Jamf Pro',
					tags: ['@pro'],
					environment: environments.custom?.pro,
				},
			]
		: [];

	for (const customTemplate of customTemplates) {
		if (customTemplate.environment == null) {
			continue;
		}

		for (const browser of browsers) {
			yield {
				name: `CUSTOM - ${customTemplate.name} - ${browser.name}`,
				grep: tagsToGrep([customTemplate.tags]),
				use: {
					...browser.use,
					baseURL: customTemplate.environment.url,
					accountCredentials: customTemplate.environment.accountCredentials,
					apiCredentials: customTemplate.environment.apiCredentials,
				},
			};
		}
	}

	if (environments.sbox?.standalone != null) {
		for (const browser of browsers) {
			yield {
				name: `SBOX - Standalone - ${browser.name}`,
				grep: tagsToGrep([browser.tags ?? [], ['@sbox']]),
				use: {
					...browser.use,
					baseURL: environments.sbox?.standalone?.url,
				},
			};
		}
	}

	const standardEnvironmentTemplates: {
		name: string;
		tags: string[];
		environmentSelector: (environments: StandardEnvironment) => Environment | undefined;
	}[] = [
		{
			name: 'Jamf School',
			tags: ['@school'],
			environmentSelector: (environments) => environments.school,
		},
		{
			name: 'Jamf Pro - Latest Develop',
			tags: ['@pro'],
			environmentSelector: (environments) => environments.pro?.develop,
		},
		{
			name: 'Jamf Pro - Latest RC',
			tags: ['@pro-legacy'],
			environmentSelector: (environments) => environments.pro?.rc,
		},
		{
			name: 'Jamf Pro - Latest GA',
			tags: ['@pro-legacy'],
			environmentSelector: (environments) => environments.pro?.ga,
		},
		{
			name: 'Jamf Pro - GA-1',
			tags: ['@pro-legacy'],
			environmentSelector: (environments) => environments.pro?.['ga-1'],
		},
		{
			name: 'Jamf Pro - GA-2',
			tags: ['@pro-legacy'],
			environmentSelector: (environments) => environments.pro?.['ga-2'],
		},
	];

	for (const standardEnvironmentType of standardEnvironmentTypes) {
		const standardEnvironment = environments[standardEnvironmentType];
		if (standardEnvironment == null) {
			continue;
		}

		for (const template of standardEnvironmentTemplates) {
			const environment = template.environmentSelector(standardEnvironment);
			if (environment == null) {
				continue;
			}

			for (const browser of browsers) {
				yield {
					name: `${standardEnvironmentType.toUpperCase()} - ${template.name} - ${browser.name}`,
					grep: tagsToGrep([browser.tags ?? [], template.tags, ['@all-environments', `@${standardEnvironmentType}`]]),
					use: {
						...browser.use,
						baseURL: environment.url,
						accountCredentials: environment.accountCredentials,
						apiCredentials: environment.apiCredentials,
					},
				};
			}
		}
	}
}

export default defineConfig({
	testDir: './tests',
	/* Run tests in files in parallel */
	fullyParallel: true,
	/* Fail the build on CI if you accidentally left test.only in the source code. */
	forbidOnly: isRunningInCI,
	/* Retry on CI only */
	retries: isRunningInCI ? 2 : 0,
	/* Opt out of parallel tests on CI. */
	workers: isRunningInCI ? 3 : undefined,
	/* Reporter to use. See https://playwright.dev/docs/test-reporters */
	reporter: [
		['html', { open: 'never' }],
		...(isRunningInCI
			? ([
					['dot'],
					['@reportportal/agent-js-playwright', RPconfig],
					['json', { outputFile: process.env.PLAYWRIGHT_JSON_OUTPUT_NAME ?? 'result/result.json' }],
				] as const)
			: [['list'] as const]),
		...(process.env.GITHUB_ACTIONS ? ([['github']] as const) : []),
	],
	/* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
	use: {
		/* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
		trace: 'retain-on-failure',
		screenshot: 'on',
		video: 'on-first-retry',
		actionTimeout: 10 * 1000,
		navigationTimeout: 15 * 1000,
	},
	/* Timeout for each test */
	timeout: 2 * 60 * 1000,

	projects: [...generateProjects()],
});
