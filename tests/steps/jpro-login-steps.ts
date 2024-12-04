import * as process from 'node:process';
import type { Page } from '@playwright/test';
import UtilsSteps from './utils-steps';

function assertString(value: unknown, propertyName?: string): asserts value is string {
	if (typeof value !== 'string') {
		throw new Error(`Expected ${propertyName} value to be a string`);
	}
}

export default class JProLoginSteps {
	private utilsSteps: UtilsSteps;
	constructor(private page: Page) {
		this.utilsSteps = new UtilsSteps(page);
	}

	public async loginToJamfPro(baseUrl: string) {
		assertString(process.env.USER_MAIL, 'USER_MAIL');
		assertString(process.env.USER_PASSWORD, 'USER_PASSWORD');

		const emailInput = this.page.getByLabel('Email');
		const continueButton = this.page.getByRole('button', { name: 'Continue' });
		const passwordInput = this.page.getByLabel('Password');
		const loginButton = this.page.getByRole('button', { name: 'Log in using Jamf ID' });
		const continueToJProButton = this.page.getByRole('button', { name: 'Continue to Jamf Pro' });

		await this.utilsSteps.disableAnimations();
		await this.page.goto(baseUrl);
		await this.page.waitForLoadState('load');

		await emailInput.fill(process.env.USER_MAIL);
		await continueButton.click();
		await passwordInput.fill(process.env.USER_PASSWORD);
		await loginButton.click();
		await continueToJProButton.click();
		await this.page.waitForLoadState('load');
	}
}
