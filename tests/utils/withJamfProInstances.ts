// withJamfProInstances.ts
import { test as base } from '@playwright/test';
import { jamfProInstances, JamfProInstanceKey } from './jamfProInstances';

type TestOptions = { tag?: string[] };

export function forEachJamfProInstance(
	testName: string,
	options: TestOptions,
	testFn: (
		fixtures: { page: any; browserName: string; context: any } & {
			baseUrl: string;
			instanceKey: JamfProInstanceKey;
		},
		testInfo: any
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
