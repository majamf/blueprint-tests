import type { Page } from '@playwright/test';
import { Step } from '../utils/utils';

export default class UtilsSteps {
	constructor(private readonly page: Page) {}

	@Step('Disable animations')
	public async disableAnimations() {
		await this.page.emulateMedia({ reducedMotion: 'reduce' });
	}
}
