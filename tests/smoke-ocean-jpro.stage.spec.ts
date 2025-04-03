import { test } from '@playwright/test';
import { v4 as uuidv4 } from 'uuid';
import JProLoginSteps from './steps/jpro-login-steps';
import BlueprintsSteps from './steps/blueprints-steps';
import BlueprintTemplatePageSteps from './steps/blueprint-template-page-steps';
import BlueprintDetailPageSteps from './steps/blueprint-detail-page-steps';
import NavigationSteps from './steps/navigation-steps';

const baseUrl = process.env.JAMF_PRO_BASE_URL || 'https://vhdpsvhf.pyro.jamf.build/';

let id = uuidv4();

test.beforeEach(async () => {
	console.log(`Running "${test.info().title}" in ${test.info().project.name}`);
	if (test.info().retry != 0) {
		console.log(`Running ${test.info().retry}. retry of "${test.info().title}" in ${test.info().project.name}`);
	}
	id = uuidv4();
});

test('Blueprints list is loaded in Jamf Pro', { tag: ['@stage'] }, async ({ page }) => {
	const jproLoginSteps = new JProLoginSteps(page);
	const blueprintsSteps = new BlueprintsSteps(page);
	const navigationSteps = new NavigationSteps(page);

	await jproLoginSteps.loginToJamfPro(baseUrl);

	await navigationSteps.adminOpensBlueprintsViaJamfProNavigation();
	await blueprintsSteps.blueprintsPageIsOpen();

	await blueprintsSteps.thereIsAtLeastOneCard();
});

test('Blueprint can be added via templates and removed in Jamf Pro', { tag: ['@stage'] }, async ({ page }) => {
	const jproLoginSteps = new JProLoginSteps(page);
	const blueprintsSteps = new BlueprintsSteps(page);
	const blueprintTemplatePageSteps = new BlueprintTemplatePageSteps(page);
	const blueprintDetailPageSteps = new BlueprintDetailPageSteps(page);
	const navigationSteps = new NavigationSteps(page);

	await jproLoginSteps.loginToJamfPro(baseUrl);

	await navigationSteps.adminOpensBlueprintsViaJamfProNavigation();
	await blueprintsSteps.blueprintsPageIsOpen();

	await blueprintsSteps.adminsClicksOnQuickStart();

	await blueprintTemplatePageSteps.adminOpensTemplateWithName('Set passcode policies');

	await blueprintTemplatePageSteps.generalPageIsOpen();
	await blueprintTemplatePageSteps.adminFillsNameOfBlueprint('Passcode_' + id);

	await blueprintTemplatePageSteps.adminFillsDescriptionOfBlueprint('Some description');
	await blueprintTemplatePageSteps.adminClicksNextButton();

	await blueprintTemplatePageSteps.scopingPageIsOpen();
	await blueprintTemplatePageSteps.adminSelectsFirstGroupInScope();
	await blueprintTemplatePageSteps.adminClicksNextButton();

	await blueprintTemplatePageSteps.passcodePolicyPageIsOpen();
	await blueprintTemplatePageSteps.adminSelectsPasswordToBeRequired();
	await blueprintTemplatePageSteps.adminsSavesBlueprint();

	await navigationSteps.adminGoesBackToBlueprintsListViaBreadCrumbsInJPro();
	await blueprintsSteps.thereIsBlueprintWithName('Passcode_' + id);
	await blueprintsSteps.adminOpensBlueprintWithName('Passcode_' + id);

	await blueprintDetailPageSteps.adminDeletesBlueprint();
	await blueprintsSteps.thereIsNoBlueprintWithName('Passcode_' + id);
});

test(
	'Blueprint can be added via builder and removed in Jamf Pro',
	{ tag: ['@stage'] },
	async ({ page, browserName }) => {
		test.fixme(browserName !== 'chromium', 'https://jamfpdd.atlassian.net/browse/JSC-62590');
		const jproLoginSteps = new JProLoginSteps(page);
		const blueprintsSteps = new BlueprintsSteps(page);
		const blueprintDetailPageSteps = new BlueprintDetailPageSteps(page);
		const navigationSteps = new NavigationSteps(page);

		await jproLoginSteps.loginToJamfPro(baseUrl);

		await navigationSteps.adminOpensBlueprintsViaJamfProNavigation();
		await blueprintsSteps.blueprintsPageIsOpen();

		await blueprintsSteps.adminOpensBlueprintBuilder();

		await navigationSteps.newBlueprintModalIsOpen();

		await blueprintsSteps.adminFillsNameOfBlueprint('Disk_' + id);

		await blueprintsSteps.adminFillsDescriptionOfBlueprint('Some description');

		await blueprintsSteps.adminClicksCreateBlueprintButton();

		await blueprintDetailPageSteps.adminDragsAndDropsComponent('Disk management');

		await blueprintDetailPageSteps.adminOpensConfigurationOfComponent('Disk management');

		await blueprintDetailPageSteps.diskManagementDrawerIsOpened();
		await blueprintDetailPageSteps.adminClicksOnExternalStorageCheckbox();
		await blueprintDetailPageSteps.adminSavesConfigurationOfComponent();

		await blueprintDetailPageSteps.adminOpensScopeDrawer();
		await blueprintDetailPageSteps.scopingDrawerIsOpened();

		await blueprintDetailPageSteps.adminSelectsFirstGroupInScopeModal();
		await blueprintDetailPageSteps.adminSavesScope();

		await navigationSteps.adminGoesBackToBlueprintsListViaBreadCrumbsInJPro();

		await blueprintsSteps.thereIsBlueprintWithName('Disk_' + id);
		await blueprintsSteps.adminOpensBlueprintWithName('Disk_' + id);

		await blueprintDetailPageSteps.adminDeletesBlueprint();
		await blueprintsSteps.thereIsNoBlueprintWithName('Disk_' + id);
	}
);

test('Templates are properly loaded', { tag: ['@stage'] }, async ({ page }) => {
	const jproLoginSteps = new JProLoginSteps(page);
	const blueprintsSteps = new BlueprintsSteps(page);
	const navigationSteps = new NavigationSteps(page);

	await jproLoginSteps.loginToJamfPro(baseUrl);

	await navigationSteps.adminOpensBlueprintsViaJamfProNavigation();
	await blueprintsSteps.blueprintsPageIsOpen();

	await blueprintsSteps.adminsClicksOnQuickStart();
	await blueprintsSteps.verifyExpectedTemplates('Set passcode policies');
});

test('Searching in scope works', { tag: ['@stage'] }, async ({ page }) => {
	const jproLoginSteps = new JProLoginSteps(page);
	const blueprintsSteps = new BlueprintsSteps(page);
	const blueprintDetailPageSteps = new BlueprintDetailPageSteps(page);
	const navigationSteps = new NavigationSteps(page);

	await jproLoginSteps.loginToJamfPro(baseUrl);

	await navigationSteps.adminOpensBlueprintsViaJamfProNavigation();
	await blueprintsSteps.blueprintsPageIsOpen();

	await blueprintsSteps.adminOpensBlueprintBuilder();

	await navigationSteps.newBlueprintModalIsOpen();

	await blueprintsSteps.adminFillsNameOfBlueprint('Search_test' + id);
	await blueprintsSteps.adminClicksCreateBlueprintButton();

	await blueprintDetailPageSteps.adminOpensScopeDrawer();
	await blueprintDetailPageSteps.scopingDrawerIsOpened();

	await blueprintDetailPageSteps.adminSearchesForGroupInScopeDrawer('All Managed Clients');

	await blueprintDetailPageSteps.adminsClicksOnCancelButton();

	await blueprintDetailPageSteps.adminDeletesBlueprint();
	await blueprintsSteps.thereIsNoBlueprintWithName('Search_test' + id);
});
