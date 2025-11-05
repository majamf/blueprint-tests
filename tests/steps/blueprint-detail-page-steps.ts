import { expect, type Locator, type Page } from '@playwright/test';
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
	'Airprint': 'com.apple.airprint',
	'Conference Room Display': 'com.apple.conferenceroomdisplay',
	'Domains': 'com.apple.domains',
	'Lock Screen Message': 'com.apple.shareddeviceconfiguration',
	'Parental Controls: Dictionary': 'com.apple.Dictionary',
	'Restrictions': 'com.apple.applicationaccess',
	'Screensaver User': 'com.apple.screensaver.user',
	'Single App Mode': 'com.apple.app.lock',
};

const blueprintCardLocator = '*[wa-component="nebula--card"]';
const blueprintCheckboxLocator = '*[wa-component="nebula--checkbox"]';
const blueprintDrawerLocator = '*[wa-component="nebula--drawer"]';
const blueprintTextInputLocator = '*[wa-component="nebula--text-input"]';
const blueprintDropdownLocator = '*[wa-component="nebula--dropdown"]';
const blueprintToggleGroupLocator = '*[wa-component="nebula--toggle-group"]';

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

	private waitForBlueprintDeploymentSummaryResponse() {
		return this.page.waitForResponse(
			(response) =>
				response.url().includes('/blueprints/report/v1/blueprints') &&
				response.url().endsWith('/deployment-summary') &&
				response.status() === 200 &&
				response.request().method() === 'GET'
		);
	}

	private waitForBlueprintsComponentsLibraryResponse() {
		return this.page.waitForResponse(
			(response) =>
				/blueprints\/components-registry\/v1\/fragments\?search=[^&]+&page/.test(response.url()) &&
				response.status() === 200 &&
				response.request().method() === 'GET'
		);
	}

	private waitForBlueprintDetailsRefreshResponse() {
		return this.page.waitForResponse((response) => {
			const url = response.url();
			const matchesBlueprintDetails = /\/blueprints\/management\/v1\/blueprints\/[0-9a-fA-F-]{36}$/.test(url);

			return matchesBlueprintDetails && response.status() === 200 && response.request().method() === 'GET';
		});
	}

	@Step('Blueprint with name "$0" is opened')
	async blueprintWithNameIsOpened(name: string) {
		const headings = this.page.getByRole('heading', { name }).filter({ hasText: name });

		await expect(headings.first()).toBeVisible();
	}

	@Step('Change blueprint name to "$0"')
	async changeBlueprintName(newName: string) {
		const waitForUpdate = this.waitForBlueprintsUpdateResponse();
		const waitForRefresh = this.waitForBlueprintDetailsRefreshResponse();
		await this.page.getByTestId('edit-blueprint-name').click();

		const nameInput = this.page.locator('input[name="name"]');
		await nameInput.fill(newName);

		await nameInput.press('Enter');

		await Promise.all([waitForUpdate, waitForRefresh]);

		const updatedHeading = this.page.getByRole('heading', { name: newName });
		await expect(updatedHeading.first()).toBeVisible();
	}

	@Step('Change blueprint description to "$0"')
	async changeBlueprintDescription(newDescription: string) {
		const waitForUpdate = this.waitForBlueprintsUpdateResponse();
		const waitForRefresh = this.waitForBlueprintDetailsRefreshResponse();
		const descrtiptionElement = this.page.getByTestId('edit-blueprint-description');
		await descrtiptionElement.click();

		const descriptionInput = this.page.locator('input[name=description]');
		await descriptionInput.fill(newDescription);

		await descriptionInput.press('Enter');
		await Promise.all([waitForUpdate, waitForRefresh]);

		await expect(descrtiptionElement).toHaveText(newDescription);
	}

	@Step('Admin opens scope drawer')
	async adminOpensScopeDrawer() {
		const scopeCardLink = this.page.getByTestId('scope-card');

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

	@Step('Admin selects group in scope modal with name "$0"')
	async adminSelectsGroupWithNameInScope(name: string) {
		const selectedGroup = this.page.locator('[name="groupsInScope"]').locator(blueprintCheckboxLocator).getByText(name);

		await selectedGroup.click();
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
		const blueprintsComponentsLibraryPromise = this.waitForBlueprintsComponentsLibraryResponse();

		await searchInput.fill(componentName);

		await blueprintsComponentsLibraryPromise;
	}

	@Step('Admin searches for a payload key with title "$0" inside a component')
	async adminSearchesForKeyInsideComponent(payloadKey: string) {
		const searchInput = this.page.getByTestId('payloadKeySearchBarTestId').getByRole('textbox');

		await searchInput.fill(payloadKey);
	}

	@Step('Admin fills given config profile component key input field "$0" with text')
	async adminFillsKeyInputFieldWithText(componentKey: string, inputText: string) {
		const searchInput = this.page.getByTestId(`${componentKey}`).getByRole('textbox');

		await searchInput.fill(inputText);
	}

	@Step('Only one blueprint component is displayed and contains title "$0"')
	async onlyOneBlueprintComponentIsDisplayedWithTitle(componentTitle: string) {
		await expect(this.page.getByTestId('component-list').locator(blueprintCardLocator).locator('h2')).toHaveCount(1);
		await expect(this.page.getByTestId('component-list').locator(blueprintCardLocator).locator('h2')).toHaveText(
			componentTitle
		);
	}

	@Step('Only one config profile component key with title "$0" is displayed inside a component')
	async onlyOneKeyIsDisplayedInsideComponent(componentTitle: string) {
		const appleKeysWrapper = this.page
			.getByTestId('payload-settings-wrapper')
			.locator('div[class="w-full"]')
			.locator('h5');
		await expect(appleKeysWrapper).toHaveCount(1);
		await expect(appleKeysWrapper).toHaveText(componentTitle);
	}

	@Step('Given number of keys "$0" are displayed inside a component')
	async givenNumberOfKeysAreDisplayedInsideComponent(numberOfKeys: number) {
		await expect(
			this.page.getByTestId('payload-settings-wrapper').locator('div[class="w-full"]').locator('h5')
		).toHaveCount(numberOfKeys);
	}

	@Step('Disk management option with name "$0" is checked')
	async selectedDiskManagementIsChecked(name: string) {
		await expect(this.page.locator(`[name="${name}"]`).locator('input').first()).toBeChecked();
	}

	@Step('Selected option with name "$0" is checked')
	async selectedCheckboxIsChecked(payloadKey: string) {
		await expect(this.page.getByTestId(`${payloadKey}`).locator('input').first()).toBeChecked();
	}

	@Step('No config profile component payload key matches given filter option')
	async noPayloadKeyMatchesGivenFilterOption() {
		await expect(this.page.getByTestId('payload-settings-wrapper')).toHaveText(
			'No results found. Refine your search or filter criteria.'
		);
	}

	@Step('Admin clicks on external storage checkbox')
	async adminClicksOnExternalStorageCheckbox() {
		const externalStorageCheckbox = this.page.locator('[name="ExternalStorage.Included"]').first();

		await externalStorageCheckbox.click({ force: true });
	}

	@Step('Admin clicks on network storage checkbox')
	async adminClicksOnNetworkStorageCheckbox() {
		const networkStorageCheckbox = this.page.locator('[name="NetworkStorage.Included"]').first();

		await networkStorageCheckbox.click({ force: true });
	}

	@Step('Admin clicks on given checkbox inside a component')
	async adminClicksOnGivenCheckbox(checkboxName: string) {
		const checkbox = this.page.locator(blueprintCheckboxLocator).and(this.page.locator(`[value="${checkboxName}"]`));

		await checkbox.click({ force: true });
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
		//TODO add data-testid to Drawer.tsx
		const cancelButton = this.page.locator(blueprintDrawerLocator).getByRole('button', { name: 'Cancel' });

		await cancelButton.click();
	}

	@Step('Admin clicks on discard changes button')
	async adminsClicksOnDiscardChangesButton() {
		//TODO add data-testid to Drawer.tsx
		const discardChangesButton = this.page
			.locator(blueprintDrawerLocator)
			.getByRole('button', { name: 'Discard changes' });

		await discardChangesButton.click();
	}

	@Step('Admin clicks on filters button')
	async adminsClicksOnFiltersButton() {
		const filtersButton = this.page.getByTestId('filter-button');

		await filtersButton.click();
	}

	@Step('Admin selects filter with name "$0" from Filters dropdown')
	async adminSelectsFilterFromFiltersDropdown(filterName: string) {
		const filterOption = this.page
			.locator(blueprintToggleGroupLocator)
			.locator(blueprintCheckboxLocator, { hasText: filterName });

		await filterOption.click();
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

		await componentInDeclarationGroup.click();
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

		const blueprintUpdatePromise = this.waitForBlueprintsUpdateResponse();

		await this.dragAndDropElement(subjectElement, targetElement);

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
		const libraryDropzone = this.page.getByTestId('remove-fragment-dropzone');

		const blueprintUpdatePromise = this.waitForBlueprintsUpdateResponse();

		await this.dragAndDropElement(componentInDeclarationGroup, libraryDropzone);

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

	@Step('Config profile component drawer named "$0" is opened')
	async configProfileComponentDrawerIsOpened(configProfileComponent: string) {
		const componentSettingsWrapper = this.page.getByTestId('payload-settings-wrapper');

		await this.drawerWithHeadingIsOpen(configProfileComponent);
		await expect(componentSettingsWrapper).toBeVisible({ timeout: 30_000 });
	}

	@Step('Disk management add modal is opened')
	async diskManagementAddModalIsOpened() {
		const formLocator = this.page.locator("[id*='com.jamf.ddm.disk-management-configuration']");

		await this.drawerWithHeadingIsOpen('Disk Management');
		await expect(formLocator).toBeVisible();
	}

	@Step('Passcode policy add modal is opened')
	async passcodeAddModalIsOpened() {
		const formLocator = this.page.locator("[id*='com.jamf.ddm.passcode-settings-configuration']");

		await this.drawerWithHeadingIsOpen('Passcode Policy');
		await expect(formLocator).toBeVisible();
	}

	@Step('Config profile component add modal named "$0" is opened')
	async configProfileComponentAddModalIsOpened(configProfileComponent: string) {
		const componentSettingsWrapper = this.page.getByTestId('payload-settings-wrapper');

		await this.drawerWithHeadingIsOpen(configProfileComponent);
		await expect(componentSettingsWrapper).toBeVisible({ timeout: 30_000 });
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

	@Step('Admin reloads the blueprint details page')
	async adminReloadsTheBlueprintDetailsPage() {
		const blueprintDeploymentSummaryPromise = this.waitForBlueprintDeploymentSummaryResponse();
		await this.page.reload();
		await this.page.waitForLoadState('load');

		await blueprintDeploymentSummaryPromise;
	}

	@Step('There is/are "$0" deployed device(s) in Analytics')
	async thereAreDeployedDevicesInAnalytics(numberOfDevices: number) {
		const analyticsCard = this.page.getByTestId('analytics');

		const analyticsSkeleton = analyticsCard.locator('[class*="skeleton"]');

		await expect(analyticsSkeleton).not.toBeVisible();

		const deployedDevices = this.page.getByTestId('succeeded-devices');

		await expect(deployedDevices).toContainText(numberOfDevices.toString());
	}

	@Step('There is/are "$0" pending device(s) in Analytics')
	async thereArePendingDevicesInAnalytics(numberOfDevices: number) {
		const analyticsCard = this.page.getByTestId('analytics');

		const analyticsSkeleton = analyticsCard.locator('[class*="skeleton"]');

		await expect(analyticsSkeleton).not.toBeVisible();

		const pendingDevices = this.page.getByTestId('pending-devices');

		await expect(pendingDevices).toContainText(numberOfDevices.toString());
	}

	@Step('There is/are "$0" error device(s) in Analytics')
	async thereAreErrorDevicesInAnalytics(numberOfDevices: number) {
		const analyticsCard = this.page.getByTestId('analytics');

		const analyticsSkeleton = analyticsCard.locator('[class*="skeleton"]');

		await expect(analyticsSkeleton).not.toBeVisible();

		const failedDevices = this.page.getByTestId('failed-devices');

		await expect(failedDevices).toContainText(numberOfDevices.toString());
	}

	@Step('Blueprint state in Analytics card is Ready for deployment')
	async blueprintIsReadyForDeploymentInAnalyticsCard() {
		const analyticsCard = this.page.getByTestId('analytics');

		const analyticsSkeleton = analyticsCard.locator('[class*="skeleton"]');

		await expect(analyticsSkeleton).not.toBeVisible();
		await expect(analyticsCard).toContainText('Not deployed');
		await expect(analyticsCard).toContainText('Blueprint ready for deployment');
	}

	@Step('Blueprint state in Analytics card is Not ready for deployment')
	async blueprintIsNotReadyForDeploymentInAnalyticsCard() {
		const analyticsCard = this.page.getByTestId('analytics');

		const analyticsSkeleton = analyticsCard.locator('[class*="skeleton"]');

		await expect(analyticsSkeleton).not.toBeVisible();
		await expect(analyticsCard).toContainText('Incomplete');
		await expect(analyticsCard).toContainText('Define scope');
	}

	private async dragAndDropElement(subjectLocator: Locator, targetLocator: Locator) {
		await targetLocator.scrollIntoViewIfNeeded();
		await subjectLocator.scrollIntoViewIfNeeded();

		await subjectLocator.hover();
		await this.page.mouse.down();

		const targetElementBound = await targetLocator.boundingBox();

		if (!targetElementBound) {
			throw new Error(`Bounding box for element "${targetLocator}" is null.`);
		}

		await this.page.mouse.move(
			targetElementBound.x + targetElementBound.width / 2,
			targetElementBound.y + targetElementBound.height / 2,
			{ steps: 10 }
		);

		await this.page.mouse.up();
	}
}
