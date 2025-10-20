import { test as base } from '@playwright/test';

export type ApiCredentials = {
	username: string;
	password: string;
};

export type AccountCredentials = {
	email: string;
	password: string;
};

export type TestOptions = {
	accountCredentials?: AccountCredentials;
	apiCredentials?: ApiCredentials;
};

export const test = base.extend<TestOptions>({
	accountCredentials: [undefined, { option: true }],
	apiCredentials: [undefined, { option: true }],
});

export function Step(titleTemplate: string) {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	return function (originalMethod: any) {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		return function (this: any, ...args: any[]) {
			const stepTitle = titleTemplate.replaceAll(/\$(\d+)/g, (_, m) => args[+m]);
			return test.step(stepTitle, () => originalMethod.call(this, ...args));
		};
	};
}
