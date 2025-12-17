import { test as base } from '@playwright/test';
import { ReportingApi } from '@reportportal/agent-js-playwright';
import type { Attribute } from '@reportportal/agent-js-playwright/build/models';

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

test.beforeEach('Populate Report Portal attributes', ({}, info) =>
	ReportingApi.addAttributes(tagsToAttributes(info.tags))
);

export function Step(titleTemplate: string) {
	// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
	return function stepDecorator(originalMethod: Function) {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		return function replacementMethod(this: any, ...args: any[]) {
			const stepTitle = titleTemplate.replaceAll(/\$(\d+)/g, (_, m) => args[+m]);
			return test.step(stepTitle, () => originalMethod.call(this, ...args));
		};
	};
}

function tagsToAttributes(tags: string[]): Attribute[] {
	return tags
		.map((tag) => {
			const match = /^@([^=]+)=(.+)$/.exec(tag);
			if (!match) {
				return null;
			}

			const [, key, value] = match;

			return {
				key,
				value: value!,
			} satisfies Attribute;
		})
		.filter((attr) => attr != null);
}
