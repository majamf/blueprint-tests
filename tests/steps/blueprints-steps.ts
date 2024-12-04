import { expect, type Page } from '@playwright/test';

type componentsMap = {
	[templateTitle: string]: string;
};

const templatesComponentMap: componentsMap = {
	'Secure your devices': 'com.jamf.secure-devices',
	'Apply custom configuration': 'com.jamf.freeform-declarations',
	'Set passcode policies': 'com.jamf.passcode-settings',
	'Install disk management settings': 'com.jamf.disk-management',
	'Math settings': 'com.jamf.math-settings',
	'Manage Safari extensions': 'com.jamf.safari-extensions',
	'Service configuration': 'com.jamf.service-configuration-files',
	'Service background tasks': 'com.jamf.service-background-tasks',
};

const builderComponentMap: componentsMap = {
	'Apply custom configuration': 'com.jamf.ddm.free-form',
	'Passcode Policy': 'com.jamf.ddm.passcode-settings',
	'Disk management': 'com.jamf.ddm.disk-management',
	'Math settings': 'com.jamf.ddm.math-settings',
	'Safari Extensions': 'com.jamf.ddm.safari-extensions',
	'Service configuration': 'com.jamf.ddm.service-configuration-files',
	'Service background tasks': 'com.jamf.ddm.service-background-tasks',
};

const blueprintButtonLocator = '*[wa-component="nebula--button"]';
const blueprintCardLocator = '*[wa-component="nebula--card"]';
const blueprintCheckboxLocator = '*[wa-component="nebula--checkbox"]';
const blueprintDropdownLocator = '*[wa-component="nebula--dropdown"]';
const blueprintDrawerLocator = '*[wa-component="nebula--drawer"]';

export default class BlueprintsSteps {
	constructor(private page: Page) {}

	private async waitForBlueprintsToLoad(url: string) {
		await this.page.waitForURL(url);
		await this.page.waitForLoadState('load');
		await this.waitForBlueprintsResponse();
	}

	private waitForBlueprintsResponse() {
		return this.page.waitForResponse(
			(response) =>
				response.url().includes('/blueprints/management/v1/blueprints') &&
				response.status() === 200 &&
				response.request().method() === 'GET'
		);
	}

	public async pageWithHeadingIsOpen(heading: string) {
		await this.page.waitForLoadState('load');

		const headingLocator = this.page.getByRole('heading', { name: heading });
		await expect(headingLocator).toBeVisible();
	}

	async modalWithHeadingIsOpen(heading: string) {
		const modal = this.page.getByRole('heading', { name: heading });

		await this.page.waitForLoadState('load');
		await modal.focus();
		await expect(modal).toBeInViewport();
	}

	async drawerWithHeadingIsOpen(heading: string) {
		await this.page.waitForLoadState('load');
		await expect(this.page.locator(blueprintDrawerLocator).getByRole('heading', { name: heading })).toBeInViewport();
	}

	async modalWithTestIdIsOpen(testId: string) {
		const modal = this.page.getByTestId(testId);
		await modal.focus();
		await expect(modal).toBeInViewport();
	}

	async navigateToRoute(route: string) {
		const url = this.baseUrl(this.page.url()) + '/' + route;

		await this.page.goto(url);
		await this.page.waitForURL('**/' + route);
		await this.page.waitForLoadState('load');
	}

	async clicksOnRadioButtonWithValue(value: string) {
		const blueprintRadioLocator = '*[wa-component="nebula--radio"][value="/' + value + '"]';
		const blueprintRadio = this.page.locator(blueprintRadioLocator);

		await blueprintRadio.click();
	}

	baseUrl(fullUrl: string) {
		const url = new URL(fullUrl);

		return `${url.protocol}//${url.host}`;
	}

	async adminOpensScopeDrawer() {
		const scopeCardLink = this.page.locator(blueprintCardLocator).filter({ hasText: 'Scope' }).getByRole('link');

		await scopeCardLink.click();
	}

	async adminGoesBackToBlueprintsListViaBreadCrumbsInJPro() {
		const breadCrumbsLink = this.page.locator('#main').getByRole('link', { name: 'Blueprints' });

		await breadCrumbsLink.click();
		await this.waitForBlueprintsToLoad('**/blueprints');
	}

	async adminGoesBackToBlueprintsListViaBreadCrumbs() {
		const breadCrumbLink = this.page.getByRole('link', { name: 'Blueprints' });

		await breadCrumbLink.click();
		await this.waitForBlueprintsToLoad('**/blueprints');
	}

	async adminOpensBlueprintsViaJamfProNavigation() {
		const blueprintsNavigation = this.page.locator('jamf-nav-side-container').getByText('Blueprints');

		await blueprintsNavigation.click();
	}

	async adminsClicksOnQuickStart() {
		await this.clicksOnRadioButtonWithValue('templates');
		await this.page.waitForURL('**/blueprints/templates');
	}

	async adminOpensBlueprintsViaUrl(baseUrl: string) {
		const url = baseUrl + '/blueprints';

		await this.page.goto(url);
		await this.waitForBlueprintsToLoad('**/blueprints');
	}

	async thereIsAtLeastOneCard() {
		const cards = this.page.locator(blueprintCardLocator);

		await expect(cards.nth(0)).toBeVisible();
	}

	async thereIsBlueprintWithName(name: string) {
		const cards = this.page.locator(blueprintCardLocator);
		const blueprintWithName = cards.filter({ hasText: name });

		await expect(blueprintWithName).toHaveCount(1);
	}

	async thereIsNoBlueprintWithName(name: string) {
		const cards = this.page.locator(blueprintCardLocator);
		const cardWithName = cards.filter({ hasText: name });

		await expect(cardWithName).toBeHidden();
	}

	async adminWaitsForScopingModalToAppear() {
		await this.modalWithTestIdIsOpen('scoping-modal');
	}

	async blueprintsPageIsOpen() {
		await this.pageWithHeadingIsOpen('Blueprints');
	}

	async scopingPageIsOpen() {
		await this.pageWithHeadingIsOpen('Choose a scope');
	}

	async generalPageIsOpen() {
		await this.pageWithHeadingIsOpen('General');
	}

	async passcodePolicyPageIsOpen() {
		await this.pageWithHeadingIsOpen('Passcode Policy');
	}

	async areYouSureModalIsOpen() {
		await this.modalWithHeadingIsOpen('Are you sure?');
	}

	async newBlueprintModalIsOpen() {
		await this.modalWithHeadingIsOpen('New blueprint');
	}

	async diskManagementDrawerIsOpen() {
		const formLocator = this.page.locator('#blueprints-builder-com\\.jamf\\.ddm\\.disk-management-configuration');

		await this.drawerWithHeadingIsOpen('Disk Management');
		await expect(formLocator).toBeVisible();
	}

	async scopingDrawerIsOpen() {
		await this.drawerWithHeadingIsOpen('Scope');
	}

	async adminOpensBlueprintBuilder() {
		const createBlueprintButton = this.page.getByRole('button', { name: 'Create blueprint' });

		await createBlueprintButton.click();
	}

	async adminOpensBlueprintWithName(name: string) {
		const cards = this.page.locator(blueprintCardLocator);
		const blueprintCardLink = cards.filter({ hasText: name }).getByRole('link');

		await blueprintCardLink.click();
	}

	async adminsOpensTemplatesRoute() {
		await this.navigateToRoute('templates');
	}

	async adminsOpensBlueprintsRoute() {
		await this.navigateToRoute('blueprints');
	}

	async adminOpensTemplateWithName(templateTitle: string) {
		const templateLink = this.page.locator('a[href*="' + templatesComponentMap[templateTitle] + '"]');
		const url = '**/new-blueprint?template=' + templatesComponentMap[templateTitle];

		await templateLink.click();
		await this.page.waitForURL(url);
		await this.page.waitForLoadState('load');
	}

	async adminFillsNameOfBlueprint(name: string) {
		const nameInput = this.page.locator('input[name="name"]');

		await nameInput.fill(name);
	}

	async adminFillsDescriptionOfBlueprint(description: string) {
		const descriptionInput = this.page.locator('textarea[name="description"], input[name="description"]');

		await descriptionInput.fill(description);
	}

	async adminSelectsFirstGroupInScope() {
		const firstGroup = this.page.locator(blueprintCheckboxLocator).nth(0);

		await firstGroup.click();
	}

	async adminSelectsFirstGroupInScopeModal() {
		const firstGroup = this.page.locator(blueprintCheckboxLocator).nth(0).locator('span').first();

		await firstGroup.click();
	}

	async adminSelectsPasswordToBeRequired() {
		const passwordCheckbox = this.page.getByText('Require passcode on device').locator('label');

		await passwordCheckbox.click();
	}

	async adminClicksOnExternalStorageCheckbox() {
		const externalStorageCheckbox = this.page
			.locator(blueprintCheckboxLocator)
			.filter({ hasText: 'External storage' })
			.locator('label div')
			.first();

		await externalStorageCheckbox.click();
	}

	async adminClicksNextButton() {
		const nextButton = this.page.getByRole('button', { name: 'Next' });

		await nextButton.click();
	}

	async adminClicksCreateBlueprintButton() {
		const createButton = this.page.getByTestId('create-blueprint-button').getByRole('button', { name: 'Create' });

		await createButton.click();
	}

	async adminSavesScope() {
		const saveButton = this.page
			.locator(blueprintDrawerLocator)
			.getByRole('button', { name: 'Save' })
			.locator('visible=true');

		await saveButton.click();
	}

	async adminsSavesBlueprint() {
		const saveButton = this.page.locator(blueprintButtonLocator).locator('*[type="submit"]');

		await saveButton.click();
		await this.waitForBlueprintsToLoad('**/blueprints/*');
	}

	async adminDeletesBlueprint() {
		const dropdown = this.page.locator(blueprintDropdownLocator);
		const deleteButton = dropdown.getByText('Delete');
		const deleteButtonInModal = this.page.getByRole('button', { name: 'Delete', exact: true });

		await dropdown.focus();
		await dropdown.click();

		await deleteButton.focus();
		await deleteButton.click();

		await this.areYouSureModalIsOpen();

		await deleteButtonInModal.click();
		await this.waitForBlueprintsToLoad('**/blueprints');
	}

	async adminOpensConfigurationOfComponent() {
		const configureButton = this.page.getByTestId('configure-component-button');

		await configureButton.focus();
		await configureButton.click();
	}

	async adminSavesConfigurationOfComponent() {
		const saveButton = this.page.getByTestId('save-component-button');

		await saveButton.click();
	}

	async adminDragsAndDropsComponent(componentTitle: string) {
		// https://github.com/microsoft/playwright/issues/13855
		const subjectSelector = '[data-rbd-draggable-id="' + builderComponentMap[componentTitle] + '"]';
		const targetSelector = '[data-testid="step-0"]';
		const subjectElement = this.page.locator(subjectSelector);
		const targetElement = this.page.locator(targetSelector);

		await targetElement.scrollIntoViewIfNeeded();
		await subjectElement.scrollIntoViewIfNeeded();

		const subjectElementBound = await subjectElement.boundingBox();

		if (!subjectElementBound) {
			throw new Error(`Bounding box for element "${subjectSelector}" is null.`);
		}

		const targetElementBound = await targetElement.boundingBox();

		if (!targetElementBound) {
			throw new Error(`Bounding box for element "${targetElementBound}" is null.`);
		}
		await this.page.mouse.move(subjectElementBound.x, subjectElementBound.y, { steps: 10 });

		await this.page.dispatchEvent(subjectSelector, 'mousedown', {
			button: 0,
			force: true,
		});

		const x = targetElementBound.x + targetElementBound.width / 2;
		const y = targetElementBound.y + targetElementBound.height / 2;

		await this.page.mouse.move(x, y, { steps: 10 });

		await this.page.dispatchEvent(targetSelector, 'mouseup', {
			button: 0,
			force: true,
		});
		await this.page.waitForLoadState('load');
	}
}
