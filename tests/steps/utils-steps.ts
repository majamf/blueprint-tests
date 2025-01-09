import type { Page } from '@playwright/test';
import { Step } from './utils';

export default class UtilsSteps {
	constructor(private page: Page) {}

	@Step('Disable animations')
	public async disableAnimations() {
		await this.page.addStyleTag({
			content: `
    * {
      animation: none !important;
      transition: none !important;
    }
  `,
		});
	}
}
