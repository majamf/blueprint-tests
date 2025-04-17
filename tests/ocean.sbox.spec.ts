import { test } from '@playwright/test';
import { v4 as uuidv4 } from 'uuid';

import SboxSetupSteps from './steps/sbox-setup-steps';
import BlueprintsSteps from './steps/blueprints-steps';
import BlueprintTemplatePageSteps from './steps/blueprint-template-page-steps';
import BlueprintDetailPageSteps from './steps/blueprint-detail-page-steps';
import NavigationSteps from './steps/navigation-steps';

const baseUrl = process.env.SBOX_BASE_URL || 'https://blueprints.sbox-mfe.jamf.io';
const clusterUrl = 'https://tyk.sbox.ocean.jamf.build';

let id = uuidv4();

test.beforeEach(async () => {
	console.log(`Running "${test.info().title}" in ${test.info().project.name}`);
	if (test.info().retry != 0) {
		console.log(`Running ${test.info().retry}. retry of "${test.info().title}" in ${test.info().project.name}`);
	}
	id = uuidv4();
});

test('Blueprint can be added via templates and removed', { tag: ['@sbox'] }, async ({ page }) => {
	const sboxSteps = new SboxSetupSteps(page);
	const blueprintSteps = new BlueprintsSteps(page);
	const blueprintTemplatePageSteps = new BlueprintTemplatePageSteps(page);
	const blueprintDetailPageSteps = new BlueprintDetailPageSteps(page);
	const navigationSteps = new NavigationSteps(page);

	await sboxSteps.sboxIsSetUp(baseUrl, clusterUrl);
	await navigationSteps.adminsOpensTemplatesRoute();

	await blueprintTemplatePageSteps.adminOpensTemplateWithName('Set passcode policies');

	await blueprintTemplatePageSteps.generalPageIsOpen();
	await blueprintTemplatePageSteps.adminFillsNameOfBlueprint('Passcode_' + id);

	await blueprintTemplatePageSteps.adminFillsDescriptionOfBlueprint('Some description');
	await blueprintTemplatePageSteps.adminClicksNextButton();

	await blueprintTemplatePageSteps.scopingPageIsOpen();
	await blueprintTemplatePageSteps.adminClicksNextButton();

	await blueprintTemplatePageSteps.passcodePolicyPageIsOpen();
	await blueprintTemplatePageSteps.adminSelectsPasswordToBeRequired();
	await blueprintTemplatePageSteps.adminsSavesBlueprint();

	await blueprintDetailPageSteps.blueprintWithNameIsOpened('Passcode_' + id);

	await blueprintDetailPageSteps.adminWaitsForToastToDisappear('Blueprint created');

	await navigationSteps.adminsOpensBlueprintsRoute();
	await blueprintSteps.thereIsBlueprintWithName('Passcode_' + id);
	await blueprintSteps.adminOpensBlueprintWithName('Passcode_' + id);

	await blueprintDetailPageSteps.adminDeletesBlueprint();
	await blueprintSteps.thereIsNoBlueprintWithName('Passcode_' + id);
});

test('Name and description of blueprint can be updated', { tag: ['@sbox'] }, async ({ page }) => {
	const sboxSteps = new SboxSetupSteps(page);
	const blueprintSteps = new BlueprintsSteps(page);
	const blueprintDetailPageSteps = new BlueprintDetailPageSteps(page);
	const navigationSteps = new NavigationSteps(page);

	await sboxSteps.sboxIsSetUp(baseUrl, clusterUrl);

	await blueprintSteps.adminOpensBlueprintBuilder();

	await navigationSteps.newBlueprintModalIsOpen();

	await blueprintSteps.adminFillsNameOfBlueprint('Disk_' + id);
	await blueprintSteps.adminFillsDescriptionOfBlueprint('Some description');
	await blueprintSteps.adminClicksCreateBlueprintButton();

	await blueprintDetailPageSteps.adminEditsDetailsOfBlueprint('Name updated' + id, 'Description updated' + id);
	await navigationSteps.adminsOpensBlueprintsRoute();
	await blueprintSteps.thereIsBlueprintWithName('Name updated' + id);
	await blueprintSteps.thereIsBlueprintWithDescription('Description updated' + id);

	await blueprintSteps.adminOpensBlueprintWithName('Name updated' + id);
	await blueprintDetailPageSteps.adminDeletesBlueprint();
	await blueprintSteps.thereIsNoBlueprintWithName('Name updated' + id);
});

test('Configuration of component can be updated', { tag: ['@sbox'] }, async ({ page }) => {
	const sboxSteps = new SboxSetupSteps(page);
	const blueprintSteps = new BlueprintsSteps(page);
	const blueprintDetailPageSteps = new BlueprintDetailPageSteps(page);
	const navigationSteps = new NavigationSteps(page);
	await sboxSteps.sboxIsSetUp(baseUrl, clusterUrl);

	await blueprintSteps.adminOpensBlueprintBuilder();

	await navigationSteps.newBlueprintModalIsOpen();

	await blueprintSteps.adminFillsNameOfBlueprint('Disk_' + id);
	await blueprintSteps.adminFillsDescriptionOfBlueprint('Some description');
	await blueprintSteps.adminClicksCreateBlueprintButton();

	await blueprintDetailPageSteps.adminOpensAddModalOfComponent('Disk management');

	await blueprintDetailPageSteps.diskManagementAddModalIsOpened();
	await blueprintDetailPageSteps.adminClicksOnExternalStorageCheckbox();
	await blueprintDetailPageSteps.adminAddsConfigurationOfComponent();

	await blueprintDetailPageSteps.adminOpensConfigurationOfComponent('Disk management');
	await blueprintDetailPageSteps.diskManagementDrawerIsOpened();
	await blueprintDetailPageSteps.adminClicksOnNetworkStorageCheckbox();
	await blueprintDetailPageSteps.adminSavesConfigurationOfComponent();

	await blueprintDetailPageSteps.adminOpensConfigurationOfComponent('Disk management');
	await blueprintDetailPageSteps.diskManagementDrawerIsOpened();
	await blueprintDetailPageSteps.selectedDiskManagementIsChecked('Network storage');
	await blueprintDetailPageSteps.adminsClicksOnCancelButton();

	await blueprintDetailPageSteps.adminDeletesBlueprint();
});

test('Components of blueprint can be updated', { tag: ['@sbox'] }, async ({ page }) => {
	const sboxSteps = new SboxSetupSteps(page);
	const blueprintSteps = new BlueprintsSteps(page);
	const blueprintDetailPageSteps = new BlueprintDetailPageSteps(page);
	const navigationSteps = new NavigationSteps(page);
	await sboxSteps.sboxIsSetUp(baseUrl, clusterUrl);

	await blueprintSteps.adminOpensBlueprintBuilder();

	await navigationSteps.newBlueprintModalIsOpen();
	await blueprintSteps.adminFillsNameOfBlueprint('Disk_' + id);
	await blueprintSteps.adminFillsDescriptionOfBlueprint('Some description');
	await blueprintSteps.adminClicksCreateBlueprintButton();

	await blueprintDetailPageSteps.adminSearchesForComponent('Disk management');
	await blueprintDetailPageSteps.adminOpensAddModalOfComponent('Disk management');

	await blueprintDetailPageSteps.adminAddsConfigurationOfComponent();

	await navigationSteps.adminsOpensBlueprintsRoute();
	await blueprintSteps.adminOpensBlueprintWithName('Disk_' + id);

	await blueprintDetailPageSteps.adminSearchesForComponent('Passcode Policy');
	await blueprintDetailPageSteps.adminOpensAddModalOfComponent('Passcode Policy');
	await blueprintDetailPageSteps.adminAddsConfigurationOfComponent();

	await blueprintDetailPageSteps.adminDeletesComponent('Disk management');

	await blueprintDetailPageSteps.adminDeletesBlueprint();
});

test('Blueprint templates can be filtered', { tag: ['@sbox'] }, async ({ page }) => {
	const sboxSteps = new SboxSetupSteps(page);
	const blueprintSteps = new BlueprintsSteps(page);
	const blueprintTemplatePageSteps = new BlueprintTemplatePageSteps(page);
	const navigationSteps = new NavigationSteps(page);
	await sboxSteps.sboxIsSetUp(baseUrl, clusterUrl);

	await navigationSteps.adminsOpensTemplatesRoute();
	await blueprintSteps.moreThanOneBlueprintTemplateIsDisplayed();

	await blueprintSteps.adminSearchesForBlueprintTemplate('Set passcode policies');
	await blueprintSteps.onlyOneBlueprintTemplateIsDisplayedWithTitle('Set passcode policies');

	await blueprintTemplatePageSteps.adminOpensTemplateWithName('Set passcode policies');
	await blueprintTemplatePageSteps.generalPageIsOpen();
});

test('Blueprints can be filtered', { tag: ['@sbox'] }, async ({ page }) => {
	const sboxSteps = new SboxSetupSteps(page);
	const blueprintSteps = new BlueprintsSteps(page);
	const navigationSteps = new NavigationSteps(page);
	await sboxSteps.sboxIsSetUp(baseUrl, clusterUrl);

	await blueprintSteps.adminOpensBlueprintBuilder();

	await navigationSteps.newBlueprintModalIsOpen();
	await blueprintSteps.adminFillsNameOfBlueprint('Blueprint_' + id);
	await blueprintSteps.adminClicksCreateBlueprintButton();

	await navigationSteps.adminsOpensBlueprintsRoute();
	await blueprintSteps.adminOpensBlueprintBuilder();
	await navigationSteps.newBlueprintModalIsOpen();
	await blueprintSteps.adminFillsNameOfBlueprint('Blueprint2_' + id);
	await blueprintSteps.adminClicksCreateBlueprintButton();

	await navigationSteps.adminsOpensBlueprintsRoute();
	await blueprintSteps.adminSearchesForBlueprint('Blueprint2_' + id);
	await blueprintSteps.thereIsNoBlueprintWithName('Blueprint_' + id);
	await blueprintSteps.onlyOneBlueprintIsDisplayedWithName('Blueprint2_' + id);
});

test('Available components of blueprint can be filtered', { tag: ['@sbox'] }, async ({ page }) => {
	const sboxSteps = new SboxSetupSteps(page);
	const blueprintSteps = new BlueprintsSteps(page);
	const blueprintDetailPageSteps = new BlueprintDetailPageSteps(page);
	const navigationSteps = new NavigationSteps(page);
	await sboxSteps.sboxIsSetUp(baseUrl, clusterUrl);

	await blueprintSteps.adminOpensBlueprintBuilder();
	await navigationSteps.newBlueprintModalIsOpen();
	await blueprintSteps.adminFillsNameOfBlueprint('Blueprint_' + id);
	await blueprintSteps.adminClicksCreateBlueprintButton();

	await blueprintDetailPageSteps.adminSearchesForComponent('Passcode');
	await blueprintDetailPageSteps.onlyOneBlueprintComponentIsDisplayedWithTitle('Passcode Policy');
});
