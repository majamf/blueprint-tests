import { expect, type Page } from '@playwright/test';
import { Step } from '../utils/utils';

export default class NavigationSteps {
	constructor(private readonly page: Page) {}

	public waitForBlueprintsResponse() {
		return this.page.waitForResponse(
			(response) =>
				response.url().includes('/blueprints/management/v1/blueprints') &&
				response.status() === 200 &&
				response.request().method() === 'GET'
		);
	}

	private baseUrl(fullUrl: string) {
		const url = new URL(fullUrl);

		return `${url.protocol}//${url.host}`;
	}

	@Step('Page with heading "$0" is opened')
	async pageWithHeadingIsOpen(heading: string) {
		await this.page.waitForLoadState('load');

		const headingLocator = this.page.getByRole('heading', { name: heading });
		await expect(headingLocator).toBeVisible({ timeout: 30_000 });
	}

	@Step('Admin navigates to route "$0"')
	async navigateToRoute(route: string) {
		const url = this.baseUrl(this.page.url()) + '/' + route;

		await this.page.goto(url);
		await this.page.waitForURL('**/' + route);
		await this.page.waitForLoadState('load');
	}

	@Step('Admin navigates to templates')
	async adminsOpensTemplatesRoute() {
		await this.navigateToRoute('templates');
	}

	@Step('Admin goes back to blueprints list via breadcrumbs in Jamf Pro')
	async adminGoesBackToBlueprintsListViaBreadCrumbsInJPro() {
		const breadCrumbsLink = this.page.locator('#main').getByRole('link', { name: 'Blueprints' });

		const blueprintGetPromise = this.waitForBlueprintsResponse();

		await breadCrumbsLink.click();

		await this.page.waitForURL('**/list');

		await blueprintGetPromise;
	}

	@Step('Admin opens blueprints via Jamf Pro navigation')
	async adminOpensBlueprintsViaJamfProNavigation() {
		const blueprintsNavigation = this.page.locator('jamf-nav-side-container').getByText('Blueprints');

		const blueprintGetPromise = this.waitForBlueprintsResponse();

		await blueprintsNavigation.click();

		await blueprintGetPromise;
	}

	@Step('Admin goes back to blueprints list via breadcrumbs in Jamf School')
	async adminGoesBackToBlueprintsListViaBreadCrumbsInJamfSchool() {
		const breadCrumbsLink = this.page.getByTestId('blueprints-wrapper').getByRole('link', { name: 'Blueprints' });

		const blueprintGetPromise = this.waitForBlueprintsResponse();

		await breadCrumbsLink.click();

		await this.page.waitForURL('**/list');

		await blueprintGetPromise;
	}

	@Step('Admin opens blueprints via Jamf School navigation')
	async adminOpensBlueprintsViaJamfSchoolNavigation() {
		const blueprintsNavigation = this.page.locator('.topmenu').getByText('Blueprints');

		const blueprintGetPromise = this.waitForBlueprintsResponse();
		await blueprintsNavigation.click();

		await blueprintGetPromise;
	}

	@Step('Admin navigates to blueprints')
	async adminsOpensBlueprintsRoute() {
		const blueprintGetPromise = this.waitForBlueprintsResponse();

		await this.navigateToRoute('list');

		await blueprintGetPromise;
	}

	@Step('Modal with heading "$0" is open')
	async modalWithHeadingIsOpen(heading: string) {
		const modal = this.page.getByRole('heading', { name: heading });

		await this.page.waitForLoadState('load');
		await modal.focus();
		await expect(modal).toBeInViewport();
	}

	@Step('New blueprint modal is opened')
	async newBlueprintModalIsOpen() {
		await this.modalWithHeadingIsOpen('New blueprint');
	}
}
