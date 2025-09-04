import * as process from 'node:process';
import type { Page } from '@playwright/test';
import UtilsSteps from './utils-steps';
import { assertEnvironmentVariable, Step } from '../utils/utils';

export default class JProLoginSteps {
	private readonly utilsSteps: UtilsSteps;

	constructor(private readonly page: Page) {
		this.utilsSteps = new UtilsSteps(page);
	}

	@Step('Login to Jamf Pro at "$0"')
	public async loginToJamfPro(baseUrl: string) {
		assertEnvironmentVariable(process.env.JAMF_ACCOUNT_STAGE_USER_MAIL, 'JAMF_ACCOUNT_STAGE_USER_MAIL');
		assertEnvironmentVariable(process.env.JAMF_ACCOUNT_STAGE_USER_PASSWORD, 'JAMF_ACCOUNT_STAGE_USER_PASSWORD');

		const emailInput = this.page.getByLabel('Email');
		const continueButton = this.page.getByRole('button', { name: 'Continue' });
		const passwordInput = this.page.getByRole('textbox', { name: 'Password' });
		const loginButton = this.page.getByRole('button', { name: 'Log in using Jamf ID' });
		const continueToJProButton = this.page.getByRole('button', { name: 'Continue to Jamf Pro' });
		const blueprintsNavItem = this.page.locator('jamf-nav-single-item#blueprints-nav-item');
		const slasaAgreeButton = this.page.locator('[data-test-id="slasa-agree-button"] > jamf-button');

		await this.utilsSteps.disableAnimations();
		await this.page.goto(baseUrl);
		await this.page.waitForLoadState('load');

		await emailInput.fill(process.env.JAMF_ACCOUNT_STAGE_USER_MAIL);
		await continueButton.click();
		await passwordInput.fill(process.env.JAMF_ACCOUNT_STAGE_USER_PASSWORD);
		await loginButton.click();
		await continueToJProButton.click({ timeout: 15_000 });

		await blueprintsNavItem.waitFor();

		if (await slasaAgreeButton.isVisible()) {
			const slasaAgreementContent = this.page.locator('jp-slasa-content > div');

			await slasaAgreementContent.focus();

			while ((await slasaAgreeButton.getAttribute('is-disabled')) !== null) {
				await this.page.keyboard.press('End');
			}

			await slasaAgreeButton.click();
		}
	}
}
