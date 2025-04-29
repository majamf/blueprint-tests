import { expect, type Page } from '@playwright/test';
import { Step } from '../utils/utils';
import NavigationSteps from './navigation-steps';
import BlueprintsSteps from './blueprints-steps';

type componentsMap = {
	[templateTitle: string]: string;
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

const blueprintCardLocator = '*[wa-component="nebula--card"]';
const blueprintCheckboxLocator = '*[wa-component="nebula--checkbox"]';
const blueprintDrawerLocator = '*[wa-component="nebula--drawer"]';
const blueprintTextInputLocator = '*[wa-component="nebula--text-input"]';
const blueprintDropdownLocator = '*[wa-component="nebula--dropdown"]';

export default class BlueprintDetailPageSteps {
	private readonly blueprintsSteps: BlueprintsSteps;
	private readonly navigationSteps: NavigationSteps;

	constructor(private readonly page: Page) {
		this.blueprintsSteps = new BlueprintsSteps(page);
		this.navigationSteps = new NavigationSteps(page);
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

	@Step('Blueprint with name "$0" is opened')
	async blueprintWithNameIsOpened(name: string) {
		const blueprintHeading = this.page.getByRole('heading', { name: name });

		await expect(blueprintHeading).toBeVisible();
	}

	@Step('Admin opens scope drawer')
	async adminOpensScopeDrawer() {
		const scopeCardLink = this.page
			.locator(blueprintCardLocator, { has: this.page.locator(`h5`).getByText('Scope') })
			.getByRole('link');

		await scopeCardLink.click();
	}

	@Step('Admin selects first group in scope modal')
	async adminSelectsFirstGroupInScopeModal() {
		const firstGroup = this.page
			.locator('[name="groupsInScope"]')
			.locator(blueprintCheckboxLocator)
			.nth(0)
			.locator('span')
			.first();

		await firstGroup.click();
	}

	@Step('Admin selects group in scope modal at index "$0"')
	async adminSelectsCertainGroupInScopeModal(index: number) {
		const certainGroup = this.page
			.locator('[name="groupsInScope"]')
			.locator(blueprintCheckboxLocator)
			.nth(index)
			.locator('span')
			.first();

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

	@Step('Only one blueprint component is displayed and contains title "$0"')
	async onlyOneBlueprintComponentIsDisplayedWithTitle(componentTitle: string) {
		await expect(this.page.getByTestId('component-list').locator(blueprintCardLocator).locator('h2')).toHaveCount(1);
		await expect(this.page.getByTestId('component-list').locator(blueprintCardLocator).locator('h2')).toHaveText(
			componentTitle
		);
	}

	@Step('Disk management option with name "$0" is checked')
	async selectedDiskManagementIsChecked(name: string) {
		await expect(this.page.locator(blueprintCheckboxLocator, { hasText: name }).locator('span').first()).toBeChecked();
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

	@Step('Admin clicks on cancel button')
	async adminsClicksOnCancelButton() {
		const cancelButton = this.page.locator(blueprintDrawerLocator).getByRole('button', { name: 'Cancel' });

		await cancelButton.click();
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

	@Step('Admin waits for toast "$0" to disappear')
	async adminWaitsForToastToDisappear(toast: string) {
		const successToast = this.page.getByText(toast);

		await successToast.waitFor({ state: 'hidden' });
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

	@Step('Drawer with heading "$0" is open')
	async drawerWithHeadingIsOpen(heading: string) {
		const headingLocator = this.page.locator(blueprintDrawerLocator).getByRole('heading', { name: heading });

		await expect(headingLocator).toBeInViewport();
	}

	@Step('Disk management drawer is opened')
	async diskManagementDrawerIsOpened() {
		const formLocator = this.page.locator("[id*='com.jamf.ddm.disk-management-configuration']");

		await this.drawerWithHeadingIsOpen('Disk Management');
		await expect(formLocator).toBeVisible();
	}

	@Step('Disk management add modal is opened')
	async diskManagementAddModalIsOpened() {
		const formLocator = this.page.locator("[id*='com.jamf.ddm.disk-management-configuration']");

		await this.drawerWithHeadingIsOpen('Disk Management');
		await expect(formLocator).toBeVisible();
	}

	@Step('Scoping drawer is opened')
	async scopingDrawerIsOpened() {
		await this.drawerWithHeadingIsOpen('Scope');
	}

	@Step('Confirm delete modal is opened')
	async confirmDeleteModalIsOpened() {
		await this.navigationSteps.modalWithHeadingIsOpen('Delete this blueprint?');
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

		await this.confirmDeleteModalIsOpened();

		const blueprintGetPromise = this.navigationSteps.waitForBlueprintsResponse();

		await confirmDeleteButton.click();

		await this.page.waitForURL('**/list');

		await blueprintGetPromise;
	}

	@Step('Admin saves metadata')
	async adminSavesMetadata() {
		const saveButton = this.page.locator(blueprintDrawerLocator).getByRole('button', { name: 'Save' });

		const blueprintUpdatePromise = this.waitForBlueprintsUpdateResponse();
		await saveButton.click();
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

		await this.blueprintsSteps.adminFillsNameOfBlueprint(name);
		await this.blueprintsSteps.adminFillsDescriptionOfBlueprint(description);
		await this.adminSavesMetadata();
	}
}
