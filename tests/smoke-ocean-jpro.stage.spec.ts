import { test } from '@playwright/test';
import { v4 as uuidv4 } from 'uuid';
import JProLoginSteps from './steps/jpro-login-steps';
import BlueprintsSteps from './steps/blueprints-steps';

const baseUrl = 'https://forqhqdg.pyro.jamf.build';

const id = uuidv4();

test.beforeEach(async () => {
	console.log(`Running "${test.info().title}" in ${test.info().project.name}`);
	if (test.info().retry != 0) {
		console.log(`Running ${test.info().retry}. retry of "${test.info().title}" in ${test.info().project.name}`);
	}
});

test('Blueprints list is loaded in Jamf Pro', { tag: '@stage' }, async ({ page }) => {
	const jproLoginSteps = new JProLoginSteps(page);
	const blueprintsSteps = new BlueprintsSteps(page);

	await jproLoginSteps.loginToJamfPro(baseUrl);

	await blueprintsSteps.adminOpensBlueprintsViaJamfProNavigation();
	await blueprintsSteps.blueprintsPageIsOpen();

	await blueprintsSteps.thereIsAtLeastOneCard();
});

test('Blueprint can be added via templates and removed in Jamf Pro', { tag: '@stage' }, async ({ page }) => {
	const jproLoginSteps = new JProLoginSteps(page);
	const blueprintsSteps = new BlueprintsSteps(page);

	await jproLoginSteps.loginToJamfPro(baseUrl);

	await blueprintsSteps.adminOpensBlueprintsViaJamfProNavigation();
	await blueprintsSteps.blueprintsPageIsOpen();

	await blueprintsSteps.adminsClicksOnQuickStart();

	await blueprintsSteps.adminOpensTemplateWithName('Set passcode policies');

	await blueprintsSteps.generalPageIsOpen();
	await blueprintsSteps.adminFillsNameOfBlueprint('Passcode_' + id);

	await blueprintsSteps.adminFillsDescriptionOfBlueprint('Some description');
	await blueprintsSteps.adminClicksNextButton();

	await blueprintsSteps.scopingPageIsOpen();
	await blueprintsSteps.adminSelectsFirstGroupInScope();
	await blueprintsSteps.adminClicksNextButton();

	await blueprintsSteps.passcodePolicyPageIsOpen();
	await blueprintsSteps.adminSelectsPasswordToBeRequired();
	await blueprintsSteps.adminsSavesBlueprint();

	await blueprintsSteps.adminGoesBackToBlueprintsListViaBreadCrumbsInJPro();
	await blueprintsSteps.thereIsBlueprintWithName('Passcode_' + id);
	await blueprintsSteps.adminOpensBlueprintWithName('Passcode_' + id);

	await blueprintsSteps.adminDeletesBlueprint();
	await blueprintsSteps.thereIsNoBlueprintWithName('Passcode_' + id);
});

test('Blueprint can be added via builder and removed in Jamf Pro', { tag: '@stage' }, async ({ page }) => {
	const jproLoginSteps = new JProLoginSteps(page);
	const blueprintsSteps = new BlueprintsSteps(page);

	await jproLoginSteps.loginToJamfPro(baseUrl);

	await blueprintsSteps.adminOpensBlueprintsViaJamfProNavigation();
	await blueprintsSteps.blueprintsPageIsOpen();

	await blueprintsSteps.adminOpensBlueprintBuilder();

	await blueprintsSteps.newBlueprintModalIsOpen();

	await blueprintsSteps.adminFillsNameOfBlueprint('Disk_' + id);

	await blueprintsSteps.adminFillsDescriptionOfBlueprint('Some description');

	await blueprintsSteps.adminClicksCreateBlueprintButton();

	await blueprintsSteps.adminDragsAndDropsComponent('Disk management');

	await blueprintsSteps.adminOpensConfigurationOfComponent('Disk management');

	await blueprintsSteps.diskManagementDrawerIsOpened();
	await blueprintsSteps.adminClicksOnExternalStorageCheckbox();
	await blueprintsSteps.adminSavesConfigurationOfComponent();

	await blueprintsSteps.adminOpensScopeDrawer();
	await blueprintsSteps.scopingDrawerIsOpened();

	await blueprintsSteps.adminSelectsFirstGroupInScopeModal();
	await blueprintsSteps.adminSavesScope();

	await blueprintsSteps.adminGoesBackToBlueprintsListViaBreadCrumbsInJPro();

	await blueprintsSteps.thereIsBlueprintWithName('Disk_' + id);
	await blueprintsSteps.adminOpensBlueprintWithName('Disk_' + id);

	await blueprintsSteps.adminDeletesBlueprint();
	await blueprintsSteps.thereIsNoBlueprintWithName('Disk_' + id);
});

test('Templates are properly loaded', { tag: '@stage' }, async ({ page }) => {
	const jproLoginSteps = new JProLoginSteps(page);
	const blueprintsSteps = new BlueprintsSteps(page);

	await jproLoginSteps.loginToJamfPro(baseUrl);

	await blueprintsSteps.adminOpensBlueprintsViaJamfProNavigation();
	await blueprintsSteps.blueprintsPageIsOpen();

	await blueprintsSteps.adminsClicksOnQuickStart();
	await blueprintsSteps.verifyExpectedTemplates('Set passcode policies');
});

test('Searching in scope works', { tag: '@stage' }, async ({ page }) => {
	const jproLoginSteps = new JProLoginSteps(page);
	const blueprintsSteps = new BlueprintsSteps(page);

	await jproLoginSteps.loginToJamfPro(baseUrl);

	await blueprintsSteps.adminOpensBlueprintsViaJamfProNavigation();
	await blueprintsSteps.blueprintsPageIsOpen();

	await blueprintsSteps.adminOpensBlueprintBuilder();

	await blueprintsSteps.newBlueprintModalIsOpen();

	await blueprintsSteps.adminFillsNameOfBlueprint('Search_test' + id);
	await blueprintsSteps.adminClicksCreateBlueprintButton();

	await blueprintsSteps.adminOpensScopeDrawer();
	await blueprintsSteps.scopingDrawerIsOpened();

	await blueprintsSteps.adminSearchesForGroupInScope('All Managed Clients');

	await blueprintsSteps.adminsClicksOnCancelButton();

	await blueprintsSteps.adminDeletesBlueprint();
	await blueprintsSteps.thereIsNoBlueprintWithName('Search_test' + id);
});
