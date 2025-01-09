import { expect, type Page } from '@playwright/test';
import { Step } from './utils';

type componentsMap = {
	[templateTitle: string]: string;
};

const templatesComponentMap: componentsMap = {
	'Secure your devices': 'com.jamf.secure-devices',
	'Update software to latest version': 'com.jamf.sw-update',
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

	// private async waitForBlueprintsToLoad(url: string) {
	// 	await this.page.waitForURL(url);
	// 	await this.waitForBlueprintsResponse();
	// 	await this.page.waitForLoadState('load');
	// }

	private waitForBlueprintsResponse() {
		return this.page.waitForResponse(
			(response) =>
				response.url().includes('/blueprints/management/v1/blueprints') &&
				response.status() === 200 &&
				response.request().method() === 'GET'
		);
	}

	private waitForBlueprintsCreateResponse() {
		return this.page.waitForResponse(
			(response) =>
				response.url().includes('/blueprints/management/v1/blueprints') &&
				response.status() === 201 &&
				response.request().method() === 'POST'
		);
	}

	private waitForBlueprintsUpdateResponse() {
		return this.page.waitForResponse(
			(response) =>
				response.url().includes('/blueprints/management/v1/blueprints') &&
				response.status() === 204 &&
				response.request().method() === 'PATCH'
		);
	}

	@Step('Page with heading "$0" is opened')
	public async pageWithHeadingIsOpen(heading: string) {
		await this.page.waitForLoadState('load');

		const headingLocator = this.page.getByRole('heading', { name: heading });
		await expect(headingLocator).toBeVisible();
	}

	@Step('Modal with heading "$0" is open')
	async modalWithHeadingIsOpen(heading: string) {
		const modal = this.page.getByRole('heading', { name: heading });

		await this.page.waitForLoadState('load');
		await modal.focus();
		await expect(modal).toBeInViewport();
	}

	@Step('Drawer with heading "$0" is open')
	async drawerWithHeadingIsOpen(heading: string) {
		await this.page.waitForLoadState('load');
		await expect(this.page.locator(blueprintDrawerLocator).getByRole('heading', { name: heading })).toBeInViewport();
	}

	@Step('Modal with test id "$0" is open')
	async modalWithTestIdIsOpen(testId: string) {
		const modal = this.page.getByTestId(testId);
		await modal.focus();
		await expect(modal).toBeInViewport();
	}

	@Step('Admin navigates to route "$0"')
	async navigateToRoute(route: string) {
		const url = this.baseUrl(this.page.url()) + '/' + route;

		await this.page.goto(url);
		await this.page.waitForURL('**/' + route);
		await this.page.waitForLoadState('load');
	}

	@Step('Admin clicks on radio button with value "$0"')
	async clicksOnRadioButtonWithValue(value: string) {
		const blueprintRadioLocator = '*[wa-component="nebula--radio"][value="/' + value + '"]';
		const blueprintRadio = this.page.locator(blueprintRadioLocator);

		await blueprintRadio.click();
	}

	baseUrl(fullUrl: string) {
		const url = new URL(fullUrl);

		return `${url.protocol}//${url.host}`;
	}

	@Step('Admin opens scope drawer')
	async adminOpensScopeDrawer() {
		const scopeCardLink = this.page
			.locator(blueprintCardLocator, { has: this.page.locator(`h5:has-text("Scope")`) })
			.getByRole('link');

		await scopeCardLink.click();
	}

	@Step('Admin goes back to blueprints list via breadcrumbs in Jamf Pro')
	async adminGoesBackToBlueprintsListViaBreadCrumbsInJPro() {
		const breadCrumbsLink = this.page.locator('#main').getByRole('link', { name: 'Blueprints' });

		const blueprintGetPromise = this.waitForBlueprintsResponse();

		await breadCrumbsLink.click();

		await this.page.waitForURL('**/blueprints');

		await blueprintGetPromise;
	}

	@Step('Admin goes back to blueprints list via breadcrumbs')
	async adminGoesBackToBlueprintsListViaBreadCrumbs() {
		const breadCrumbLink = this.page.getByRole('link', { name: 'Blueprints' });

		const blueprintGetPromise = this.waitForBlueprintsResponse();

		await breadCrumbLink.click();

		await this.page.waitForURL('**/blueprints');

		await blueprintGetPromise;
	}

	@Step('Admin opens blueprints via Jamf Pro navigation')
	async adminOpensBlueprintsViaJamfProNavigation() {
		const blueprintsNavigation = this.page.locator('jamf-nav-side-container').getByText('Blueprints');

		const blueprintGetPromise = this.waitForBlueprintsResponse();

		await blueprintsNavigation.click();

		await blueprintGetPromise;
	}

	@Step('Admin clicks on quick start')
	async adminsClicksOnQuickStart() {
		await this.clicksOnRadioButtonWithValue('templates');
		await this.page.waitForURL('**/blueprints/templates');
	}

	@Step('Admin opens blueprints via url "$0"')
	async adminOpensBlueprintsViaUrl(baseUrl: string) {
		const url = baseUrl + '/blueprints';

		const blueprintGetPromise = this.waitForBlueprintsResponse();

		await this.page.goto(url);

		await this.page.waitForURL('**/blueprints');

		await blueprintGetPromise;
	}

	@Step('Admin waits for blueprints to load')
	async thereIsAtLeastOneCard() {
		const cards = this.page.locator(blueprintCardLocator);

		await expect(cards.nth(0)).toBeVisible();
	}

	@Step('There is blueprint with name "$0"')
	async thereIsBlueprintWithName(name: string) {
		const cards = this.page.locator(blueprintCardLocator);
		const blueprintWithName = cards.filter({ hasText: name });

		await expect(blueprintWithName).toHaveCount(1, { timeout: 10000 });
	}

	@Step('There is blueprint with description "$0"')
	async thereIsBlueprintWithDescription(description: string) {
		const cards = this.page.locator(blueprintCardLocator);
		const blueprintWithDescription = cards.filter({ hasText: description });

		await expect(blueprintWithDescription).toHaveCount(1);
	}

	@Step('There is no blueprint with name "$0"')
	async thereIsNoBlueprintWithName(name: string) {
		const cards = this.page.locator(blueprintCardLocator);
		const cardWithName = cards.filter({ hasText: name });

		await expect(cardWithName).toBeHidden();
	}

	@Step('Admin waits for scoping modal to appear')
	async adminWaitsForScopingModalToAppear() {
		await this.modalWithTestIdIsOpen('scoping-modal');
	}

	@Step('Blueprints page is opened')
	async blueprintsPageIsOpen() {
		await this.pageWithHeadingIsOpen('Blueprints');
	}

	@Step('Scoping page is opened')
	async scopingPageIsOpen() {
		await this.pageWithHeadingIsOpen('Choose a scope');
	}

	@Step('General page is opened')
	async generalPageIsOpen() {
		await this.pageWithHeadingIsOpen('General');
	}

	@Step('Passcode policy page is opened')
	async passcodePolicyPageIsOpen() {
		await this.pageWithHeadingIsOpen('Passcode Policy');
	}

	@Step('Are you sure modal is open')
	async areYouSureModalIsOpen() {
		await this.modalWithHeadingIsOpen('Are you sure?');
	}

	@Step('New blueprint modal is opened')
	async newBlueprintModalIsOpen() {
		await this.modalWithHeadingIsOpen('New blueprint');
	}

	@Step('Disk management drawer is open')
	async diskManagementDrawerIsOpen() {
		const formLocator = this.page.locator("[id*='builder-com.jamf.ddm.disk-management-configuration']");

		await this.drawerWithHeadingIsOpen('Disk Management');
		await expect(formLocator).toBeVisible();
	}

	@Step('Scope drawer is open')
	async scopingDrawerIsOpen() {
		await this.drawerWithHeadingIsOpen('Scope');
	}

	@Step('Admin opens blueprint builder')
	async adminOpensBlueprintBuilder() {
		const createBlueprintButton = this.page.getByRole('button', { name: 'Create blueprint' });

		await createBlueprintButton.click();
	}

	@Step('Admin opens blueprint with name "$0"')
	async adminOpensBlueprintWithName(name: string) {
		const cards = this.page.locator(blueprintCardLocator);
		const blueprintCardLink = cards.filter({ hasText: name }).getByRole('link');

		await blueprintCardLink.click();
	}

	@Step('Admin navigates to templates')
	async adminsOpensTemplatesRoute() {
		await this.navigateToRoute('templates');
	}

	@Step('Admin navigates to blueprints')
	async adminsOpensBlueprintsRoute() {
		const blueprintGetPromise = this.waitForBlueprintsResponse();

		await this.navigateToRoute('blueprints');

		await blueprintGetPromise;
	}

	@Step('Template with name "$0" is visible')
	async verifyExpectedTemplates(templateTitle: string) {
		const expectedTemplateLocator = this.page.locator(`h5:has-text("${templateTitle}")`);

		await expect(expectedTemplateLocator).toBeVisible();
	}

	@Step('Admin opens template with name "$0"')
	async adminOpensTemplateWithName(templateTitle: string) {
		const templateLink = this.page.locator('a[href*="' + templatesComponentMap[templateTitle] + '"]');
		const url = '**/new-blueprint?template=' + templatesComponentMap[templateTitle];

		await templateLink.click();
		await this.page.waitForURL(url);
		await this.page.waitForLoadState('load');
	}

	@Step('Admin fills name of blueprint')
	async adminFillsNameOfBlueprint(name: string) {
		const nameInput = this.page.locator('input[name="name"]');

		await nameInput.fill(name);
	}

	@Step('Admin fills description of blueprint')
	async adminFillsDescriptionOfBlueprint(description: string) {
		const descriptionInput = this.page.locator('textarea[name="description"], input[name="description"]');

		await descriptionInput.fill(description);
	}

	@Step('Admin selects first group in scope')
	async adminSelectsFirstGroupInScope() {
		const firstGroup = this.page.locator(blueprintCheckboxLocator).nth(0);

		await firstGroup.click();
	}

	@Step('Admin selects certain group in scope')
	async adminSelectsCertainGroupInScope(index: number) {
		const certainGroup = this.page.locator(blueprintCheckboxLocator).nth(index);

		await certainGroup.click();
	}

	@Step('Admin selects first group in scope modal')
	async adminSelectsFirstGroupInScopeModal() {
		const firstGroup = this.page.locator(blueprintCheckboxLocator).nth(0).locator('span').first();

		await firstGroup.click();
	}

	@Step('Admin selects group in scope modal at index "$0"')
	async adminSelectsCertainGroupInScopeModal(index: number) {
		const certainGroup = this.page.locator(blueprintCheckboxLocator).nth(index).locator('span').first();

		await certainGroup.click();
	}

	@Step('Selected scope is checked at index "$0"')
	async selectedScopeIsChecked(index: number) {
		await expect(this.page.locator(blueprintCheckboxLocator).nth(index).locator('span').first()).toBeChecked();
	}

	@Step('Admin searches for group with name "$0" in scope')
	async adminSearchesForGroupInScope(group: string) {
		const searchInput = this.page.locator('input[placeholder="Search"]');

		await searchInput.fill(group);

		const groupLocator = this.page.locator(`[wa-component="nebula--checkbox"]:has-text("${group}")`);
		await groupLocator.waitFor();
		await expect(groupLocator).toBeVisible();
		await expect(groupLocator).toHaveText(group);
	}

	@Step('Disk management option with name "$0" is checked')
	async selectedDiskManagementIsChecked(name: string) {
		await expect(
			this.page.locator(blueprintCheckboxLocator).filter({ hasText: name }).locator('span').first()
		).toBeChecked();
	}

	@Step('Admin selects password to be required')
	async adminSelectsPasswordToBeRequired() {
		const passwordCheckbox = this.page.getByText('Require passcode on device').locator('label');

		await passwordCheckbox.click();
	}

	@Step('Admin clicks on external storage checkbox')
	async adminClicksOnExternalStorageCheckbox() {
		const externalStorageCheckbox = this.page
			.locator(blueprintCheckboxLocator)
			.filter({ hasText: 'External storage' })
			.locator('label div')
			.first();

		await externalStorageCheckbox.click();
	}

	@Step('Admin clicks on network storage checkbox')
	async adminClicksOnNetworkStorageCheckbox() {
		const externalStorageCheckbox = this.page
			.locator(blueprintCheckboxLocator)
			.filter({ hasText: 'Network storage' })
			.locator('label div')
			.first();

		await externalStorageCheckbox.click();
	}

	@Step('Admin clicks next button')
	async adminClicksNextButton() {
		const nextButton = this.page.getByRole('button', { name: 'Next' });

		await nextButton.click();
	}

	@Step('Admin clicks create blueprint button')
	async adminClicksCreateBlueprintButton() {
		const createButton = this.page.getByTestId('create-blueprint-button').getByRole('button', { name: 'Create' });

		const blueprintCreatePromise = this.waitForBlueprintsCreateResponse();
		await createButton.click();
		await blueprintCreatePromise;
	}

	@Step('Admin saves scope')
	async adminSavesScope() {
		const saveButton = this.page
			.locator(blueprintDrawerLocator)
			.getByRole('button', { name: 'Save' })
			.locator('visible=true');

		const blueprintUpdatePromise = this.waitForBlueprintsUpdateResponse();
		await saveButton.click();
		await blueprintUpdatePromise;
	}

	@Step('Admin saves metadata')
	async adminSavesMetadata() {
		const saveButton = this.page.locator(blueprintDrawerLocator).getByRole('button', { name: 'Save' });

		const blueprintUpdatePromise = this.waitForBlueprintsUpdateResponse();
		await saveButton.click();
		await blueprintUpdatePromise;
	}

	@Step('Admin saves blueprint')
	async adminsSavesBlueprint() {
		const saveButton = this.page.locator(blueprintButtonLocator).locator('*[type="submit"]');

		const blueprintGetPromise = this.waitForBlueprintsResponse();

		await saveButton.click();

		await this.page.waitForURL('**/blueprints/*');

		await blueprintGetPromise;
	}

	@Step('Admin clicks on cancel button')
	async adminsClicksOnCancelButton() {
		const cancelButton = this.page.locator(blueprintDrawerLocator).getByRole('button', { name: 'Cancel' });

		await cancelButton.click();
	}

	@Step('Admin deletes blueprint')
	async adminDeletesBlueprint() {
		const dropdown = this.page.locator(blueprintDropdownLocator);
		const deleteButton = dropdown.getByText('Delete');
		const confirmDeleteButton = this.page.getByTestId('confirm-delete-button');

		await dropdown.focus();
		await dropdown.click();

		await deleteButton.focus();
		await deleteButton.click();

		await this.areYouSureModalIsOpen();

		const blueprintGetPromise = this.waitForBlueprintsResponse();

		await confirmDeleteButton.click();

		await this.page.waitForURL('**/blueprints');

		await blueprintGetPromise;
	}

	@Step('Admin opens configuration of component')
	async adminOpensConfigurationOfComponent() {
		const configureButton = this.page.getByTestId('configure-component-button');

		await configureButton.focus();
		await configureButton.click();
	}

	@Step('Admin saves configuration of component')
	async adminSavesConfigurationOfComponent() {
		const saveButton = this.page.getByTestId('save-component-button');

		const blueprintUpdatePromise = this.waitForBlueprintsUpdateResponse();
		await saveButton.click();
		await blueprintUpdatePromise;
	}

	@Step('Admin drags and drops component "$0"')
	async adminDragsAndDropsComponent(componentTitle: string) {
		// https://github.com/microsoft/playwright/issues/13855
		const subjectSelector = '[data-fragment-identifier="' + builderComponentMap[componentTitle] + '"]';
		const targetSelector = '[data-testid="step-0"]';
		const subjectElement = this.page.locator(subjectSelector);
		const targetElement = this.page.locator(targetSelector);

		await targetElement.scrollIntoViewIfNeeded();
		await subjectElement.scrollIntoViewIfNeeded();

		await subjectElement.hover();
		await this.page.mouse.down();

		const subjectElementBound = await subjectElement.boundingBox();

		if (!subjectElementBound) {
			throw new Error(`Bounding box for element "${subjectSelector}" is null.`);
		}

		const targetElementBound = await targetElement.boundingBox();

		if (!targetElementBound) {
			throw new Error(`Bounding box for element "${targetElementBound}" is null.`);
		}

		await this.page.mouse.move(
			targetElementBound.x + targetElementBound.width / 2,
			targetElementBound.y + targetElementBound.height / 2
		);

		const blueprintUpdatePromise = this.waitForBlueprintsUpdateResponse();

		await this.page.mouse.up();

		await blueprintUpdatePromise;
	}

	@Step('Admin deletes component with title "$0"')
	async adminDeletesComponent(componentTitle: string) {
		const declarationGroup = this.page.locator('[data-testid="step-0"]');

		const componentInDeclarationGroup = declarationGroup
			.locator(blueprintCardLocator)
			.filter({ hasText: componentTitle });
		await componentInDeclarationGroup.hover();

		const deleteButton = componentInDeclarationGroup.locator('[data-testid="delete-component-button"]');
		await deleteButton.focus();

		const blueprintUpdatePromise = this.waitForBlueprintsUpdateResponse();

		await deleteButton.click();

		await blueprintUpdatePromise;
	}

	@Step('Admin edits details of blueprint with new name "$0" and description "$1"')
	async adminEditsDetailsOfBlueprint(name: string, description: string) {
		const dropdown = this.page.locator(blueprintDropdownLocator);
		const editButton = dropdown.getByText('Edit details');

		await dropdown.focus();
		await dropdown.click();

		await editButton.focus();
		await editButton.click();

		await this.adminFillsNameOfBlueprint(name);
		await this.adminFillsDescriptionOfBlueprint(description);
		await this.adminSavesMetadata();
	}
}
