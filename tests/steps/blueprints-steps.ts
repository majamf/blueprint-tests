import { expect, type Page } from '@playwright/test';
import { Step } from '../utils/utils';

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
const blueprintTextInputLocator = '*[wa-component="nebula--text-input"]';

const blueprintIdUrlRegExp = new RegExp(
	/^.*\/[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[1-5][a-fA-F0-9]{3}-[89abAB][a-fA-F0-9]{3}-[a-fA-F0-9]{12}$/
);

export default class BlueprintsSteps {
	constructor(private readonly page: Page) {}

	private waitForBlueprintsResponse() {
		return this.page.waitForResponse(
			(response) =>
				response.url().includes('/blueprints/management/v1/blueprints') &&
				response.status() === 200 &&
				response.request().method() === 'GET'
		);
	}

	private async waitForBlueprintsCreateResponse() {
		const response = await this.page.waitForResponse(
			(response) =>
				response.url().includes('/blueprints/management/v1/blueprints') &&
				response.status() === 201 &&
				response.request().method() === 'POST'
		);

		const responseData = await response.json();
		return {
			response,
			data: responseData,
		};
	}

	private waitForBlueprintsDeployResponse() {
		return this.page.waitForResponse(
			(response) =>
				response.url().includes('/blueprints/management/v1/blueprints') &&
				response.url().endsWith('/deploy') &&
				response.status() === 202 &&
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

	private async filterBlueprintsAndBlueprintTemplates(filter: string) {
		const searchInput = this.page.locator(blueprintTextInputLocator).locator('input[placeholder="Search blueprints"]');
		await searchInput.fill(filter);
		const filterButton = this.page.locator('button[type="submit"]').getByText('Filter');
		await filterButton.click();
	}

	@Step('Page with heading "$0" is opened')
	async pageWithHeadingIsOpen(heading: string) {
		await this.page.waitForLoadState('load');

		const headingLocator = this.page.getByRole('heading', { name: heading });
		await expect(headingLocator).toBeVisible({ timeout: 30_000 });
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
		const headingLocator = this.page.locator(blueprintDrawerLocator).getByRole('heading', { name: heading });

		await expect(headingLocator).toBeInViewport();
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

	private baseUrl(fullUrl: string) {
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

	@Step('Admin opens blueprints via Jamf School navigation')
	async adminOpensBlueprintsViaJamfSchoolNavigation() {
		const blueprintsNavigation = this.page.locator('.topmenu').getByText('Blueprints');

		const blueprintGetPromise = this.waitForBlueprintsResponse();
		await blueprintsNavigation.click();

		await blueprintGetPromise;
	}

	@Step('Admin clicks on quick start')
	async adminsClicksOnQuickStart() {
		await this.clicksOnRadioButtonWithValue('templates');
		await this.page.waitForURL('**/blueprints/templates');
	}

	@Step('Admin waits for blueprints to load')
	async thereIsAtLeastOneCard() {
		const cards = await this.page.locator(blueprintCardLocator).all();

		expect(cards.length).toBeGreaterThanOrEqual(1);
	}

	@Step('There is blueprint with name "$0"')
	async thereIsBlueprintWithName(name: string) {
		const blueprintWithName = this.page.locator(blueprintCardLocator, { hasText: name });

		await expect(blueprintWithName).toHaveCount(1, { timeout: 10000 });
	}

	@Step('There is blueprint with description "$0"')
	async thereIsBlueprintWithDescription(description: string) {
		const blueprintWithDescription = this.page.locator(blueprintCardLocator, { hasText: description });

		await expect(blueprintWithDescription).toHaveCount(1);
	}

	@Step('There is no blueprint with name "$0"')
	async thereIsNoBlueprintWithName(name: string) {
		const cardWithName = this.page.locator(blueprintCardLocator, { hasText: name });

		await expect(cardWithName).toBeHidden();
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

	@Step('Are you sure modal is opened')
	async areYouSureModalIsOpened() {
		await this.modalWithHeadingIsOpen('Are you sure?');
	}

	@Step('New blueprint modal is opened')
	async newBlueprintModalIsOpen() {
		await this.modalWithHeadingIsOpen('New blueprint');
	}

	@Step('Disk management drawer is opened')
	async diskManagementDrawerIsOpened() {
		const formLocator = this.page.locator("[id*='builder-com.jamf.ddm.disk-management-configuration']");

		await this.drawerWithHeadingIsOpen('Disk Management');
		await expect(formLocator).toBeVisible();
	}

	@Step('Disk management add modal is opened')
	async diskManagementAddModalIsOpened() {
		const formLocator = this.page.locator("[id*='add-component-com.jamf.ddm.disk-management']");

		await this.drawerWithHeadingIsOpen('Disk Management');
		await expect(formLocator).toBeVisible();
	}

	@Step('Scoping drawer is opened')
	async scopingDrawerIsOpened() {
		await this.drawerWithHeadingIsOpen('Scope');
	}

	@Step('Admin opens blueprint builder')
	async adminOpensBlueprintBuilder() {
		const createBlueprintButton = this.page.getByRole('button', { name: 'Create blueprint' });

		await createBlueprintButton.click();
	}

	@Step('Admin opens blueprint with name "$0"')
	async adminOpensBlueprintWithName(name: string) {
		const cardWithName = this.page.locator(blueprintCardLocator, { hasText: name });
		const blueprintCardLink = cardWithName.getByRole('link');

		await blueprintCardLink.click();
	}

	@Step('Admin navigates to templates')
	async adminsOpensTemplatesRoute() {
		await this.navigateToRoute('templates');
	}

	@Step('Admin navigates to blueprints')
	async adminsOpensBlueprintsRoute() {
		const blueprintGetPromise = this.waitForBlueprintsResponse();

		await this.navigateToRoute('list');

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

	@Step('Admin selects group with name "$0" in scope')
	async adminSelectsGroupWithNameInScope(name: string) {
		const firstGroup = this.page.locator(blueprintCheckboxLocator).getByText(name);

		await firstGroup.click();
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

	@Step('Admin searches for group with name "$0" in scope drawer')
	async adminSearchesForGroupInScopeDrawer(group: string) {
		const searchInput = this.page.locator(blueprintDrawerLocator).locator('input[placeholder="Search"]');

		await searchInput.fill(group);

		const groupLocator = this.page
			.locator(blueprintDrawerLocator)
			.locator(`${blueprintCheckboxLocator}:has-text("${group}")`);
		await expect(groupLocator).toBeVisible();
		await expect(groupLocator).toHaveText(group);
	}

	@Step('Admin searches for component with name "$0"')
	async adminSearchesForComponent(componentName: string) {
		const searchInput = this.page.locator(blueprintTextInputLocator).locator('input[placeholder="Search"]');
		await searchInput.fill(componentName);
	}

	@Step('Admin searches for blueprint template "$0"')
	async adminSearchesForBlueprintTemplate(templateTitle: string) {
		await this.filterBlueprintsAndBlueprintTemplates(templateTitle);
	}

	@Step('Admin searches for blueprint "$0"')
	async adminSearchesForBlueprint(blueprintName: string) {
		await this.filterBlueprintsAndBlueprintTemplates(blueprintName);
	}

	@Step('More than one blueprint template is displayed')
	async moreThanOneBlueprintTemplateIsDisplayed() {
		await this.page.locator(blueprintCardLocator).locator('h5').first().waitFor();
		const blueprintTemplateCards = await this.page.locator(blueprintCardLocator).locator('h5').all();
		expect(blueprintTemplateCards.length).toBeGreaterThan(1);
	}

	@Step('Only one blueprint template is displayed and contains title "$0"')
	async onlyOneBlueprintTemplateIsDisplayedWithTitle(templateTitle: string) {
		await expect(this.page.locator(blueprintCardLocator).locator('h5')).toHaveCount(1);
		await expect(this.page.locator(blueprintCardLocator).locator('h5')).toHaveText(templateTitle);
	}

	@Step('Only one blueprint component is displayed and contains title "$0"')
	async onlyOneBlueprintComponentIsDisplayedWithTitle(componentTitle: string) {
		await expect(this.page.getByTestId('component-list').locator(blueprintCardLocator).locator('h2')).toHaveCount(1);
		await expect(this.page.getByTestId('component-list').locator(blueprintCardLocator).locator('h2')).toHaveText(
			componentTitle
		);
	}

	@Step('Only one blueprint is displayed and contains name "$0"')
	async onlyOneBlueprintIsDisplayedWithName(blueprintName: string) {
		await expect(this.page.locator(blueprintCardLocator).locator('h5')).toHaveCount(1);
		await expect(this.page.locator(blueprintCardLocator).locator('h5')).toHaveText(blueprintName);
	}

	@Step('Disk management option with name "$0" is checked')
	async selectedDiskManagementIsChecked(name: string) {
		await expect(this.page.locator(blueprintCheckboxLocator, { hasText: name }).locator('span').first()).toBeChecked();
	}

	@Step('Admin selects password to be required')
	async adminSelectsPasswordToBeRequired() {
		const passwordCheckbox = this.page.getByText('Require passcode on device').locator('label');

		await passwordCheckbox.click();
	}

	@Step('Admin clicks on external storage checkbox')
	async adminClicksOnExternalStorageCheckbox() {
		const externalStorageCheckbox = this.page
			.locator(blueprintCheckboxLocator, { hasText: 'External storage' })
			.locator('label div')
			.first();

		await externalStorageCheckbox.click();
	}

	@Step('Admin clicks on network storage checkbox')
	async adminClicksOnNetworkStorageCheckbox() {
		const externalStorageCheckbox = this.page
			.locator(blueprintCheckboxLocator, { hasText: 'Network storage' })
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

		const blueprintCreatePromise = this.waitForBlueprintsCreateResponse();

		await saveButton.click();

		await this.page.waitForURL(blueprintIdUrlRegExp);

		const { data } = await blueprintCreatePromise;

		return await data.id;
	}

	@Step('Admin clicks on cancel button')
	async adminsClicksOnCancelButton() {
		const cancelButton = this.page.locator(blueprintDrawerLocator).getByRole('button', { name: 'Cancel' });

		await cancelButton.click();
	}

	@Step('Admin deletes blueprint')
	async adminDeletesBlueprint() {
		const moreActionButton = this.page.locator(blueprintDropdownLocator).getByTestId('more-actions-button');
		const moreActionDropdown = this.page.locator(blueprintDropdownLocator);
		const deleteButton = moreActionDropdown.getByText('Delete');
		const confirmDeleteButton = this.page.getByTestId('confirm-delete-button');

		await moreActionButton.focus();
		await moreActionButton.click();

		await deleteButton.focus();
		await deleteButton.click();

		await this.areYouSureModalIsOpened();

		const blueprintGetPromise = this.waitForBlueprintsResponse();

		await confirmDeleteButton.click();

		await this.page.waitForURL('**/list');

		await blueprintGetPromise;
	}

	@Step('Admin deploys blueprint')
	async adminDeploysBlueprint() {
		const deployButton = this.page.getByTestId('deploy-button');

		const blueprintDeployPromise = this.waitForBlueprintsDeployResponse();

		await deployButton.click();

		await blueprintDeployPromise;
	}

	@Step('Admin opens configuration of component with title "$0"')
	async adminOpensConfigurationOfComponent(componentTitle: string) {
		const declarationGroup = this.page.getByTestId('step-0');
		const componentInDeclarationGroup = declarationGroup.locator(blueprintCardLocator, { hasText: componentTitle });

		await componentInDeclarationGroup.hover();

		const configureButton = componentInDeclarationGroup.getByTestId('configure-component-button');

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

	@Step('Admin adds configuration of component')
	async adminAddsConfigurationOfComponent() {
		const saveButton = this.page.getByTestId('add-component-button');

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
			throw new Error(`Bounding box for element "${targetSelector}" is null.`);
		}

		await this.page.mouse.move(
			targetElementBound.x + targetElementBound.width / 2,
			targetElementBound.y + targetElementBound.height / 2
		);

		const blueprintUpdatePromise = this.waitForBlueprintsUpdateResponse();

		await this.page.mouse.up();

		const componentInDeclarationGroup = targetElement.locator(blueprintCardLocator, { hasText: componentTitle });

		await expect(componentInDeclarationGroup).toBeVisible();

		await blueprintUpdatePromise;
	}

	@Step('Admin opens add modal of component with title "$0"')
	async adminOpensAddModalOfComponent(componentTitle: string) {
		const componentList = this.page.getByTestId('component-list');
		const componentInComponentList = componentList.locator(blueprintCardLocator, { hasText: componentTitle });

		await componentInComponentList.focus();
		await componentInComponentList.click();
	}

	@Step('Admin deletes component with title "$0"')
	async adminDeletesComponent(componentTitle: string) {
		const declarationGroup = this.page.getByTestId('step-0');

		const componentInDeclarationGroup = declarationGroup.locator(blueprintCardLocator, { hasText: componentTitle });
		await componentInDeclarationGroup.hover();

		const deleteButton = componentInDeclarationGroup.getByTestId('delete-component-button');
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
