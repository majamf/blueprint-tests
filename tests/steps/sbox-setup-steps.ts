import UtilsSteps from './utils-steps';
import type { Page } from '@playwright/test';
import { Step } from '../utils/utils';

export default class SboxSetupSteps {
	private readonly utilsSteps: UtilsSteps;

	constructor(private readonly page: Page) {
		this.utilsSteps = new UtilsSteps(page);
	}

	@Step('Set up SBOX with mFE URL "$0" and cluster URL "$1"')
	public async sboxIsSetUp(mFEUrl: string, clusterUrl: string) {
		const baseUrl = mFEUrl + '/?clusterUrl=' + clusterUrl;
		const tenantId = '4879d91a-1cc7-4638-ad0e-0d9e32399760';
		const localSettingsButton = this.page.locator('span').filter({ hasText: 'Local settings' }).getByRole('img');
		const tenantIdInput = this.page.getByLabel('Tenant ID');
		const applyButton = this.page.getByRole('button', { name: 'Apply' });

		await this.utilsSteps.disableAnimations();
		await this.page.goto(baseUrl);
		await this.page.waitForLoadState('load');

		await localSettingsButton.click();
		await tenantIdInput.fill(tenantId);
		await applyButton.click();

		await this.page.waitForLoadState('load');
		await this.page.reload();
		await this.page.waitForLoadState('load');
	}
}
