import * as process from 'node:process';
import type { Page } from '@playwright/test';
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
		const passwordInput = this.page.getByLabel('Password');
		const loginButton = this.page.getByRole('button', { name: 'Log in using Jamf ID' });

		await this.utilsSteps.disableAnimations();
		await this.page.goto(baseUrl);
		await this.page.waitForLoadState('load');

		await emailInput.fill(process.env.JAMF_ACCOUNT_STAGE_USER_MAIL);
		await continueButton.click();
		await passwordInput.fill(process.env.JAMF_ACCOUNT_STAGE_USER_PASSWORD);
		await loginButton.click();
		await this.page.waitForLoadState('load');
	}
}
