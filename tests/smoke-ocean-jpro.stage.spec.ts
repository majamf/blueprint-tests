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

// eslint-disable-next-line playwright/no-skipped-test
test.skip('Blueprints list is loaded', { tag: '@stage' }, async ({ page }) => {
	test.setTimeout(60_000);
	const jproLoginSteps = new JProLoginSteps(page);
	const blueprintsSteps = new BlueprintsSteps(page);

	await jproLoginSteps.loginToJamfPro(baseUrl);

	await blueprintsSteps.adminOpensBlueprintsViaJamfProNavigation();
	await blueprintsSteps.blueprintsPageIsOpen();

	await blueprintsSteps.thereIsAtLeastOneCard();
});

// eslint-disable-next-line playwright/no-skipped-test
test.skip('Blueprint can be added via templates and removed', { tag: '@stage' }, async ({ page }) => {
	test.setTimeout(100_000);

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

// eslint-disable-next-line playwright/no-skipped-test
test.skip('Blueprint can be added via builder and removed', { tag: '@stage' }, async ({ page }) => {
	test.setTimeout(100_000);
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

	await blueprintsSteps.adminOpensConfigurationOfComponent();

	await blueprintsSteps.diskManagementDrawerIsOpen();
	await blueprintsSteps.adminClicksOnExternalStorageCheckbox();
	await blueprintsSteps.adminSavesConfigurationOfComponent();

	await blueprintsSteps.adminOpensScopeDrawer();
	await blueprintsSteps.scopingDrawerIsOpen();

	await blueprintsSteps.adminSelectsFirstGroupInScopeModal();
	await blueprintsSteps.adminSavesScope();

	await blueprintsSteps.adminGoesBackToBlueprintsListViaBreadCrumbsInJPro();

	await blueprintsSteps.thereIsBlueprintWithName('Disk_' + id);
	await blueprintsSteps.adminOpensBlueprintWithName('Disk_' + id);

	await blueprintsSteps.adminDeletesBlueprint();
	await blueprintsSteps.thereIsNoBlueprintWithName('Disk_' + id);
});
