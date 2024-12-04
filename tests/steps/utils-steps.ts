import type { Page } from '@playwright/test';

export default class UtilsSteps {
	constructor(private page: Page) {}

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
