import { expect, type Page } from '@playwright/test';
import { Step } from '../utils/utils';
import BlueprintsSteps from './blueprints-steps';
import NavigationSteps from './navigation-steps';

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

const blueprintButtonLocator = '*[wa-component="nebula--button"]';
const blueprintCardLocator = '*[wa-component="nebula--card"]';
const blueprintCheckboxLocator = '*[wa-component="nebula--checkbox"]';

const blueprintIdUrlRegExp = new RegExp(
	/^.*\/[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[1-5][a-fA-F0-9]{3}-[89abAB][a-fA-F0-9]{3}-[a-fA-F0-9]{12}$/
);

export default class BlueprintTemplatePageSteps {
	private blueprintsSteps: BlueprintsSteps;
	private navigationSteps: NavigationSteps;

	constructor(private readonly page: Page) {
		this.blueprintsSteps = new BlueprintsSteps(page);
		this.navigationSteps = new NavigationSteps(page);
	}

	@Step('Admin opens template with name "$0"')
	async adminOpensTemplateWithName(templateTitle: string) {
		const url = '**/new-blueprint?template=' + templatesComponentMap[templateTitle];
		const card = this.page.locator(`${blueprintCardLocator}:has-text("${templateTitle}")`);
		await expect(card).toBeVisible({ timeout: 15_000 });

		await card.click();
		await this.page.waitForURL(url);
		await this.page.waitForLoadState('load');
	}

	@Step('Admin selects first group in scope')
	async adminSelectsFirstGroupInScope() {
		const firstGroup = this.page
			.locator('[name="groupsInScope"]')
			.locator(blueprintCheckboxLocator)
			.locator('.checkbox > .indicator')
			.first();
		await firstGroup.click();
	}

	@Step('Admin selects group with name "$0" in scope')
	async adminSelectsGroupWithNameInScope(name: string) {
		const firstGroup = this.page.locator('[name="groupsInScope"]').locator(blueprintCheckboxLocator).getByText(name);

		await firstGroup.click();
	}

	@Step('Admin selects password to be required')
	async adminSelectsPasswordToBeRequired() {
		const trueRadioButton = this.page.locator(
			'[wa-component="nebula--radio"][name="RequirePasscode.Value"][value="true"]'
		);

		await trueRadioButton.click();
	}

	@Step('Admin clicks next button')
	async adminClicksNextButton() {
		const nextButton = this.page.getByRole('button', { name: 'Next' });

		await nextButton.click();
	}

	@Step('Admin saves blueprint')
	async adminsSavesBlueprint() {
		const saveButton = this.page.locator(`${blueprintButtonLocator}[type="submit"]`, { hasText: 'Save' });

		const blueprintCreatePromise = this.blueprintsSteps.waitForBlueprintsCreateResponse();

		await saveButton.click();

		await this.page.waitForURL(blueprintIdUrlRegExp);

		const { data } = await blueprintCreatePromise;

		return await data.id;
	}

	@Step('Scoping page is opened')
	async scopingPageIsOpen() {
		await this.navigationSteps.pageWithHeadingIsOpen('Choose a scope');
		const scopingForm = this.page.locator('[name=groupsInScope]');
		await expect(scopingForm).toBeVisible({ timeout: 15_000 });
	}

	@Step('General page is opened')
	async generalPageIsOpen() {
		await this.navigationSteps.pageWithHeadingIsOpen('General');
	}

	@Step('Passcode policy page is opened')
	async passcodePolicyPageIsOpen() {
		await this.navigationSteps.pageWithHeadingIsOpen('Passcode Policy');
	}

	@Step('Admin fills name of blueprint')
	async adminFillsNameOfBlueprint(name: string) {
		await this.blueprintsSteps.fillNameOfBlueprint(name);
	}

	@Step('Admin fills description of blueprint')
	async adminFillsDescriptionOfBlueprint(description: string) {
		await this.blueprintsSteps.fillDescriptionOfBlueprint(description);
	}
}
