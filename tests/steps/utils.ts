import { test } from '@playwright/test';

export function Step(titleTemplate: string) {
	return function (originalMethod: any) {
		return function (this: any, ...args: any[]) {
			const stepTitle = titleTemplate.replaceAll(/\$(\d+)/g, (_, m) => args[+m]);
			return test.step(stepTitle, () => originalMethod.call(this, ...args));
		};
	};
}
