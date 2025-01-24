import { test } from '@playwright/test';
import { v4 as uuidv4 } from 'uuid';

import SboxSetupSteps from './steps/sbox-setup-steps';
import BlueprintsSteps from './steps/blueprints-steps';

const baseUrl = process.env.SBOX_BASE_URL || 'https://blueprints.sbox-mfe.jamf.io';
const clusterUrl = 'https://tyk.sbox.ocean.jamf.build';

const id = uuidv4();

test.beforeEach(async () => {
	console.log(`Running "${test.info().title}" in ${test.info().project.name}`);
	if (test.info().retry != 0) {
		console.log(`Running ${test.info().retry}. retry of "${test.info().title}" in ${test.info().project.name}`);
	}
});

test('Blueprint can be added via templates and removed', { tag: '@sbox' }, async ({ page }) => {
	const sboxSteps = new SboxSetupSteps(page);
	const blueprintSteps = new BlueprintsSteps(page);

	await sboxSteps.sboxIsSetUp(baseUrl, clusterUrl);
	await blueprintSteps.adminsOpensTemplatesRoute();

	await blueprintSteps.adminOpensTemplateWithName('Set passcode policies');

	await blueprintSteps.generalPageIsOpen();
	await blueprintSteps.adminFillsNameOfBlueprint('Passcode_' + id);

	await blueprintSteps.adminFillsDescriptionOfBlueprint('Some description');
	await blueprintSteps.adminClicksNextButton();

	await blueprintSteps.scopingPageIsOpen();
	await blueprintSteps.adminSelectsFirstGroupInScope();
	await blueprintSteps.adminClicksNextButton();

	await blueprintSteps.passcodePolicyPageIsOpen();
	await blueprintSteps.adminSelectsPasswordToBeRequired();
	await blueprintSteps.adminsSavesBlueprint();

	await blueprintSteps.adminsOpensBlueprintsRoute();
	await blueprintSteps.thereIsBlueprintWithName('Passcode_' + id);
	await blueprintSteps.adminOpensBlueprintWithName('Passcode_' + id);

	await blueprintSteps.adminDeletesBlueprint();
	await blueprintSteps.thereIsNoBlueprintWithName('Passcode_' + id);
});

test('Blueprint can be added via builder and removed', { tag: '@stage' }, async ({ page, browserName }) => {
	test.fixme(browserName !== 'chromium', 'https://jamfpdd.atlassian.net/browse/JSC-62590');
	const sboxSteps = new SboxSetupSteps(page);
	const blueprintSteps = new BlueprintsSteps(page);

	await sboxSteps.sboxIsSetUp(baseUrl, clusterUrl);

	await blueprintSteps.adminOpensBlueprintBuilder();

	await blueprintSteps.newBlueprintModalIsOpen();

	await blueprintSteps.adminFillsNameOfBlueprint('Disk_' + id);

	await blueprintSteps.adminFillsDescriptionOfBlueprint('Some description');

	await blueprintSteps.adminClicksCreateBlueprintButton();

	await blueprintSteps.adminDragsAndDropsComponent('Disk management');
	await blueprintSteps.adminOpensConfigurationOfComponent('Disk management');

	await blueprintSteps.diskManagementDrawerIsOpened();
	await blueprintSteps.adminClicksOnExternalStorageCheckbox();
	await blueprintSteps.adminSavesConfigurationOfComponent();

	await blueprintSteps.adminOpensScopeDrawer();
	await blueprintSteps.scopingDrawerIsOpened();

	await blueprintSteps.adminSelectsFirstGroupInScopeModal();
	await blueprintSteps.adminSavesScope();

	await blueprintSteps.adminsOpensBlueprintsRoute();

	await blueprintSteps.thereIsBlueprintWithName('Disk_' + id);
	await blueprintSteps.adminOpensBlueprintWithName('Disk_' + id);

	await blueprintSteps.adminDeletesBlueprint();
	await blueprintSteps.thereIsNoBlueprintWithName('Disk_' + id);
});

test('Name and description of blueprint can be updated', { tag: '@sbox' }, async ({ page }) => {
	const sboxSteps = new SboxSetupSteps(page);
	const blueprintSteps = new BlueprintsSteps(page);

	await sboxSteps.sboxIsSetUp(baseUrl, clusterUrl);

	await blueprintSteps.adminOpensBlueprintBuilder();

	await blueprintSteps.newBlueprintModalIsOpen();

	await blueprintSteps.adminFillsNameOfBlueprint('Disk_' + id);
	await blueprintSteps.adminFillsDescriptionOfBlueprint('Some description');
	await blueprintSteps.adminClicksCreateBlueprintButton();

	await blueprintSteps.adminEditsDetailsOfBlueprint('Name updated' + id, 'Description updated' + id);
	await blueprintSteps.adminsOpensBlueprintsRoute();
	await blueprintSteps.thereIsBlueprintWithName('Name updated' + id);
	await blueprintSteps.thereIsBlueprintWithDescription('Description updated' + id);

	await blueprintSteps.adminOpensBlueprintWithName('Name updated' + id);
	await blueprintSteps.adminDeletesBlueprint();
	await blueprintSteps.thereIsNoBlueprintWithName('Name updated' + id);
});

test('Scope of blueprint can be updated (created via builder)', { tag: '@sbox' }, async ({ page }) => {
	const sboxSteps = new SboxSetupSteps(page);
	const blueprintSteps = new BlueprintsSteps(page);

	await sboxSteps.sboxIsSetUp(baseUrl, clusterUrl);

	await blueprintSteps.adminOpensBlueprintBuilder();

	await blueprintSteps.newBlueprintModalIsOpen();

	await blueprintSteps.adminFillsNameOfBlueprint('Disk_' + id);
	await blueprintSteps.adminFillsDescriptionOfBlueprint('Some description');
	await blueprintSteps.adminClicksCreateBlueprintButton();

	await blueprintSteps.adminOpensScopeDrawer();
	await blueprintSteps.scopingDrawerIsOpened();
	await blueprintSteps.adminSelectsFirstGroupInScopeModal();
	await blueprintSteps.adminSavesScope();

	await blueprintSteps.adminOpensScopeDrawer();
	await blueprintSteps.scopingDrawerIsOpened();
	await blueprintSteps.adminSelectsCertainGroupInScopeModal(1);
	await blueprintSteps.adminSavesScope();
	await blueprintSteps.adminOpensScopeDrawer();
	await blueprintSteps.scopingDrawerIsOpened();
	await blueprintSteps.selectedScopeIsChecked(1);
	await blueprintSteps.adminsClicksOnCancelButton();

	await blueprintSteps.adminDeletesBlueprint();
});

test('Configuration of component can be updated', { tag: '@sbox' }, async ({ page }) => {
	const sboxSteps = new SboxSetupSteps(page);
	const blueprintSteps = new BlueprintsSteps(page);

	await sboxSteps.sboxIsSetUp(baseUrl, clusterUrl);

	await blueprintSteps.adminOpensBlueprintBuilder();

	await blueprintSteps.newBlueprintModalIsOpen();

	await blueprintSteps.adminFillsNameOfBlueprint('Disk_' + id);
	await blueprintSteps.adminFillsDescriptionOfBlueprint('Some description');
	await blueprintSteps.adminClicksCreateBlueprintButton();

	await blueprintSteps.adminOpensAddModalOfComponent('Disk management');

	await blueprintSteps.diskManagementAddModalIsOpened();
	await blueprintSteps.adminClicksOnExternalStorageCheckbox();
	await blueprintSteps.adminAddsConfigurationOfComponent();

	await blueprintSteps.adminOpensConfigurationOfComponent('Disk management');
	await blueprintSteps.diskManagementDrawerIsOpened();
	await blueprintSteps.adminClicksOnNetworkStorageCheckbox();
	await blueprintSteps.adminSavesConfigurationOfComponent();

	await blueprintSteps.adminOpensConfigurationOfComponent('Disk management');
	await blueprintSteps.diskManagementDrawerIsOpened();
	await blueprintSteps.selectedDiskManagementIsChecked('Network storage');
	await blueprintSteps.adminsClicksOnCancelButton();

	await blueprintSteps.adminDeletesBlueprint();
});

test('Components of blueprint can be updated', { tag: '@sbox' }, async ({ page }) => {
	const sboxSteps = new SboxSetupSteps(page);
	const blueprintSteps = new BlueprintsSteps(page);

	await sboxSteps.sboxIsSetUp(baseUrl, clusterUrl);

	await blueprintSteps.adminOpensBlueprintBuilder();

	await blueprintSteps.newBlueprintModalIsOpen();
	await blueprintSteps.adminFillsNameOfBlueprint('Disk_' + id);
	await blueprintSteps.adminFillsDescriptionOfBlueprint('Some description');
	await blueprintSteps.adminClicksCreateBlueprintButton();

	await blueprintSteps.adminOpensAddModalOfComponent('Disk management');

	await blueprintSteps.adminAddsConfigurationOfComponent();

	await blueprintSteps.adminsOpensBlueprintsRoute();
	await blueprintSteps.adminOpensBlueprintWithName('Disk_' + id);

	await blueprintSteps.adminOpensAddModalOfComponent('Passcode Policy');
	await blueprintSteps.adminAddsConfigurationOfComponent();

	await blueprintSteps.adminDeletesComponent('Disk management');

	await blueprintSteps.adminDeletesBlueprint();
});
