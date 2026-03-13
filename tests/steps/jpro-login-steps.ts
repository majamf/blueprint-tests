import { expect, type Locator, type Page, type WorkerInfo } from '@playwright/test';
import UtilsSteps from './utils-steps';
import { type AccountCredentials, Step } from '../utils/utils';
import fs from 'node:fs/promises';

export default class JProLoginSteps {
	private readonly utilsSteps: UtilsSteps;

	constructor(private readonly page: Page) {
		this.utilsSteps = new UtilsSteps(page);
	}

	@Step('Login to Jamf Pro at "$0"')
	public async loginToJamfPro(baseUrl: string, { email, password }: AccountCredentials) {
		const emailInput = this.page.getByLabel('Email');
		const continueButton = this.page.getByRole('button', { name: 'Continue' });
		const passwordInput = this.page.getByRole('textbox', { name: 'Password' });
		const loginButton = this.page.getByRole('button', { name: 'Log in using Jamf ID' });
		const jamfProVersion = this.page.locator('[data-test-id="jamf-pro-version"]');
		const blueprintsNavItem = this.page.locator('jamf-nav-single-item#blueprints-nav-item');
		const slasaAgreeButton = this.page.locator('[data-test-id="slasa-agree-button"] > jamf-button');

		await this.utilsSteps.disableAnimations();
		await this.page.goto(baseUrl);
		await this.page.waitForLoadState('load');

		await emailInput.fill(email);
		await continueButton.click();

		await this.page.waitForURL('**/login/password**');
		await this.page.waitForLoadState('load');

		await passwordInput.fill(password);
		await loginButton.click();

		await this.page.waitForLoadState('load');

		await this.handleRedirectsToPro(baseUrl);

		await expect(jamfProVersion).toBeVisible({ timeout: 15_000 });

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

	@Step('Login to Jamf Pro at "$0" with stored auth state')
	public async loginToJamfProCached(baseUrl: string, accountCredentials: AccountCredentials, workerInfo: WorkerInfo) {
		await this.utilsSteps.disableAnimations();

		const hostname = new URL(baseUrl).hostname;
		const authFile = `playwright/${hostname}_${workerInfo.parallelIndex}.auth.json`;

		const authRestored = await this.tryRestoreSession(authFile);

		if (authRestored) {
			await this.page.goto(baseUrl);
			await this.page.waitForLoadState('load');

			await this.handleRedirectsToPro(baseUrl);

			const blueprintsNavItem = this.page.locator('jamf-nav-single-item#blueprints-nav-item');

			if (await this.pollElementIsVisible(blueprintsNavItem)) {
				return;
			}
		}

		// If session restoration failed, perform a fresh login
		await this.loginToJamfPro(baseUrl, accountCredentials);

		await this.page.context().storageState({ path: authFile });
	}

	private async handleRedirectsToPro(baseUrl: string) {
		const continueToJProButton = this.page.getByRole('button', { name: 'Continue to Jamf Pro' });
		const continueWithoutPasskeyButton = this.page.getByRole('button', { name: 'Continue without passkey' });

		if (this.page.url().startsWith(baseUrl)) {
			return;
		}

		if (await this.pollElementIsVisible(continueWithoutPasskeyButton, { timeout: 15_000 })) {
			await continueWithoutPasskeyButton.click();

			await this.page.waitForLoadState('load');
		}

		if (await this.pollElementIsVisible(continueToJProButton, { timeout: 15_000 })) {
			await continueToJProButton.click({ timeout: 15_000 });

			await this.page.waitForLoadState('load');
		}
	}

	private async pollElementIsVisible(blueprintsNavItem: Locator, options?: { timeout: number }): Promise<boolean> {
		try {
			await expect(blueprintsNavItem).toBeVisible(options);
			return true;
		} catch {
			return false;
		}
	}

	private async fileExists(filePath: string): Promise<boolean> {
		try {
			await fs.access(filePath);
			return true;
		} catch {
			return false;
		}
	}

	private async tryRestoreSession(authStateFile: string): Promise<boolean> {
		if (!(await this.fileExists(authStateFile))) {
			return false;
		}

		try {
			const storageState = JSON.parse(await fs.readFile(authStateFile, 'utf-8'));

			if (storageState.cookies) {
				await this.page.context().addCookies(storageState.cookies);
			}

			if (storageState.origins) {
				for (const origin of storageState.origins) {
					await this.page.goto(origin.origin);
					for (const item of origin.localStorage) {
						await this.page.evaluate(
							([key, value]) => {
								localStorage.setItem(key, value);
							},
							[item.name, item.value]
						);
					}
				}
			}

			return true;
		} catch (error) {
			console.log('Failed to restore session:', error);
			return false;
		}
	}
}
