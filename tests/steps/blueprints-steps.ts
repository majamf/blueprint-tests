import { expect, type Page } from '@playwright/test';
import { Step } from '../utils/utils';
import NavigationSteps from './navigation-steps';

const blueprintCardLocator = '*[wa-component="nebula--card"]';
const blueprintTextInputLocator = '*[wa-component="nebula--text-input"]';

export default class BlueprintsSteps {
	private navigationSteps: NavigationSteps;

	constructor(private readonly page: Page) {
		this.navigationSteps = new NavigationSteps(page);
	}

	public async waitForBlueprintsCreateResponse() {
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

	public async fillNameOfBlueprint(name: string) {
		const nameInput = this.page.locator('input[name="name"]');
		await nameInput.fill(name);
	}

	public async fillDescriptionOfBlueprint(description: string) {
		const descriptionInput = this.page.locator('textarea[name="description"], input[name="description"]');
		await descriptionInput.fill(description);
	}

	private async filterBlueprintsAndBlueprintTemplates(filter: string) {
		const searchInput = this.page.locator(blueprintTextInputLocator).locator('input[placeholder="Search blueprints"]');
		await searchInput.fill(filter);
		const filterButton = this.page.locator('button[type="submit"]').getByText('Filter');
		await filterButton.click();
	}

	@Step('Admin clicks on radio button with value "$0"')
	async clicksOnRadioButtonWithValue(value: string) {
		const blueprintRadioLocator = '*[wa-component="nebula--radio"][value="/' + value + '"]';
		const blueprintRadio = this.page.locator(blueprintRadioLocator);

		await blueprintRadio.click();
	}

	@Step('Admin clicks on quick start')
	async adminsClicksOnQuickStart() {
		await this.clicksOnRadioButtonWithValue('templates');
		await this.page.waitForURL('**/blueprints/templates');
	}

	@Step('Admin waits for blueprints to load')
	async thereIsAtLeastOneCard() {
		const cards = this.page.locator(blueprintCardLocator);
		await expect(cards).not.toHaveCount(0);
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

	@Step('Template with name "$0" is visible')
	async verifyExpectedTemplates(templateTitle: string) {
		const expectedTemplateLocator = this.page.locator(`h5:has-text("${templateTitle}")`);

		await expect(expectedTemplateLocator).toBeVisible();
	}

	@Step('Admin fills name of blueprint')
	async adminFillsNameOfBlueprint(name: string) {
		await this.fillNameOfBlueprint(name);
	}

	@Step('Admin fills description of blueprint')
	async adminFillsDescriptionOfBlueprint(description: string) {
		await this.fillDescriptionOfBlueprint(description);
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

	@Step('Only one blueprint is displayed and contains name "$0"')
	async onlyOneBlueprintIsDisplayedWithName(blueprintName: string) {
		await expect(this.page.locator(blueprintCardLocator).locator('h5')).toHaveCount(1);
		await expect(this.page.locator(blueprintCardLocator).locator('h5')).toHaveText(blueprintName);
	}

	@Step('Admin clicks create blueprint button')
	async adminClicksCreateBlueprintButton() {
		const blueprintIdUrlRegExp = new RegExp(
			/^.*\/[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[1-5][a-fA-F0-9]{3}-[89abAB][a-fA-F0-9]{3}-[a-fA-F0-9]{12}$/
		);
		const createButton = this.page.getByTestId('create-blueprint-button').getByRole('button', { name: 'Create' });

		const blueprintCreatePromise = this.waitForBlueprintsCreateResponse();
		await createButton.click();
		await blueprintCreatePromise;
		await this.page.waitForURL(blueprintIdUrlRegExp);

		const { data } = await blueprintCreatePromise;

		return await data.id;
	}

	@Step('Blueprints page is opened')
	async blueprintsPageIsOpen() {
		await this.navigationSteps.pageWithHeadingIsOpen('Blueprints');
	}
}
