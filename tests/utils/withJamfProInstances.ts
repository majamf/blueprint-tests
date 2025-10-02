// withJamfProInstances.ts
import { type BrowserContext, type Page, test as base, type TestInfo } from '@playwright/test';
import { jamfProInstances, type JamfProInstanceKey } from './jamfProInstances';

type TestOptions = { tag?: string[] };

export function forEachJamfProInstance(
	testName: string,
	options: TestOptions,
	testFn: (
		fixtures: { page: Page; browserName: string; context: BrowserContext } & {
			baseUrl: string;
			instanceKey: JamfProInstanceKey;
		},
		testInfo: TestInfo
	) => Promise<void>
) {
	Object.entries(jamfProInstances).forEach(([key, baseUrl]) => {
		base(`${testName} [${key}]`, options, async ({ page, browserName, context }, testInfo) => {
			await testFn(
				{
					page,
					browserName,
					context,
					baseUrl,
					instanceKey: key as JamfProInstanceKey,
				},
				testInfo
			);
		});
	});
}
