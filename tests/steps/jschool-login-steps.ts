import { expect, type Page } from '@playwright/test';
import UtilsSteps from './utils-steps';
import { type AccountCredentials, Step } from '../utils/utils';

export default class JSchoolLoginSteps {
	private readonly utilsSteps: UtilsSteps;

	constructor(private readonly page: Page) {
		this.utilsSteps = new UtilsSteps(page);
	}

	@Step('Login to Jamf School at "$0"')
	public async loginToJamfSchool(baseUrl: string, { email, password }: AccountCredentials) {
		const emailInput = this.page.getByLabel('Email');
		const continueButton = this.page.getByRole('button', { name: 'Login' });
		const passwordInput = this.page.getByRole('textbox', { name: 'Password' });
		const loginButton = this.page.getByRole('button', { name: 'Log in using Jamf ID' });

		await this.utilsSteps.disableAnimations();
		await this.page.goto(baseUrl);
		await this.page.waitForLoadState('load');

		await emailInput.fill(email);
		await continueButton.click();

		await this.page.waitForURL('**/login/password**');
		await this.page.waitForLoadState('load');

		await passwordInput.fill(password);

		await loginButton.click();

		await this.page.waitForURL(baseUrl + '/**');
		await this.page.waitForLoadState('load');

		if (this.page.url().startsWith(baseUrl + 'agreement')) {
			await this.page.getByRole('link', { name: 'Continue' }).click();

			await this.page.getByRole('link', { name: 'Yes, I am authorized' }).click();

			await this.page.getByLabel('Job description').fill('Testing blueprints in Jamf School');
			await this.page.getByRole('link', { name: 'Continue' }).click();

			await this.page.getByLabel('I accept the terms of this agreement').check();
			await this.page.getByRole('button', { name: 'Accept' }).click();

			await this.page.getByRole('link', { name: 'Continue' }).click();
		}

		await this.page.waitForURL('**/dashboard');

		const dashboardHeadingLocator = this.page.getByRole('heading', { name: 'Dashboard' });
		await expect(dashboardHeadingLocator).toBeVisible({ timeout: 30_000 });

		const devicesLink = this.page.getByRole('link', { name: 'Devices', exact: true });
		await devicesLink.click();

		const inventoryLink = this.page.locator('.topmenu').getByRole('link', { name: 'Inventory' });
		await inventoryLink.click();

		await this.page.waitForURL('**/devices');
		await this.page.waitForLoadState('load');

		const devicesHeadingLocator = this.page.getByRole('heading', { name: 'Devices' });
		await expect(devicesHeadingLocator).toBeVisible({ timeout: 30_000 });
	}
}
