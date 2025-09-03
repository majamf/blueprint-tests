import * as process from 'node:process';
import { expect, type Page } from '@playwright/test';
import UtilsSteps from './utils-steps';
import { assertEnvironmentVariable, Step } from '../utils/utils';

export default class JSchoolLoginSteps {
	private readonly utilsSteps: UtilsSteps;

	constructor(private readonly page: Page) {
		this.utilsSteps = new UtilsSteps(page);
	}

	@Step('Login to Jamf School at "$0"')
	public async loginToJamfSchool(baseUrl: string) {
		assertEnvironmentVariable(process.env.JAMF_ACCOUNT_STAGE_USER_MAIL, 'JAMF_ACCOUNT_STAGE_USER_MAIL');
		assertEnvironmentVariable(process.env.JAMF_ACCOUNT_STAGE_USER_PASSWORD, 'JAMF_ACCOUNT_STAGE_USER_PASSWORD');

		const emailInput = this.page.getByLabel('Email');
		const continueButton = this.page.getByRole('button', { name: 'Login' });
		const passwordInput = this.page.getByRole('textbox', { name: 'Password' });
		const loginButton = this.page.getByRole('button', { name: 'Log in using Jamf ID' });

		await this.utilsSteps.disableAnimations();
		await this.page.goto(baseUrl);
		await this.page.waitForLoadState('load');

		const loginPasswordRequest = this.page.waitForResponse(
			(response) =>
				response.url().includes('/login/password') && response.status() === 200 && response.request().method() === 'GET'
		);

		await emailInput.fill(process.env.JAMF_ACCOUNT_STAGE_USER_MAIL);
		await continueButton.click();

		await this.page.waitForLoadState('load');
		await loginPasswordRequest;

		const apiTokenRequest = this.page.waitForResponse(
			(response) =>
				response.url().includes('/default/apiToken') &&
				response.status() === 200 &&
				response.request().method() === 'GET'
		);

		const dashboardRequests = this.page.waitForResponse(
			(response) =>
				response.url().includes('/dashboard/') && response.status() === 200 && response.request().method() === 'GET'
		);

		await passwordInput.fill(process.env.JAMF_ACCOUNT_STAGE_USER_PASSWORD);
		await loginButton.click();

		await this.page.waitForURL(baseUrl + '**');

		if (this.page.url().startsWith(baseUrl + 'agreement')) {
			await this.page.getByRole('link', { name: 'Continue' }).click();

			await this.page.getByRole('link', { name: 'Yes, I am authorized' }).click();

			await this.page.getByLabel('Job description').fill('Testing blueprints in Jamf School');
			await this.page.getByRole('link', { name: 'Continue' }).click();

			await this.page.getByLabel('I accept the terms of this agreement').check();
			await this.page.getByRole('button', { name: 'Accept' }).click();

			await this.page.getByRole('link', { name: 'Continue' }).click();
		}

		await apiTokenRequest;
		await dashboardRequests;

		const dashboardHeadingLocator = this.page.getByRole('heading', { name: 'Dashboard' });
		await expect(dashboardHeadingLocator).toBeVisible({ timeout: 30_000 });

		const devicesLink = this.page.getByRole('link', { name: 'Devices', exact: true });
		await devicesLink.click();

		const blueprintsFFRequest = this.page.waitForResponse(
			async (response) =>
				response.url().includes('/default/getFeatureFlag/blueprints') &&
				response.status() === 200 &&
				response.request().method() === 'GET' &&
				(await response.json()).blueprints === true
		);

		const blueprintsRolloutFFRequest = this.page.waitForResponse(
			async (response) =>
				response.url().includes('/default/getFeatureFlag/blueprints-rollout') &&
				response.status() === 200 &&
				response.request().method() === 'GET' &&
				(await response.json())['blueprints-rollout'] === true
		);

		const devicesRequest = this.page.waitForResponse(
			(response) =>
				response.url().includes('/apiv2/devices') && response.status() === 200 && response.request().method() === 'GET'
		);

		const inventoryLink = this.page.locator('.topmenu').getByRole('link', { name: 'Inventory' });
		await inventoryLink.click();

		await this.page.waitForLoadState('load');
		await blueprintsFFRequest;
		await blueprintsRolloutFFRequest;
		await devicesRequest;

		const devicesHeadingLocator = this.page.getByRole('heading', { name: 'Devices' });
		await expect(devicesHeadingLocator).toBeVisible({ timeout: 30_000 });
	}
}
