import { test } from '@playwright/test';

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

export function assertEnvironmentVariable(value: unknown, propertyName?: string): asserts value is string {
	if (typeof value !== 'string') {
		throw new Error(`Expected ${propertyName} value to be a string`);
	}
}
