import { test } from '../utils/utils';
import { v4 as uuidv4 } from 'uuid';

import SboxSetupSteps from '../steps/sbox-setup-steps';
import BlueprintsSteps from '../steps/blueprints-steps';
import BlueprintTemplatePageSteps from '../steps/blueprint-template-page-steps';
import BlueprintDetailPageSteps from '../steps/blueprint-detail-page-steps';
import NavigationSteps from '../steps/navigation-steps';

const clusterUrl = 'https://tyk.sbox.ocean.jamf.build';

let id = uuidv4();

test.beforeEach(async () => {
	console.log(`Running "${test.info().title}" in ${test.info().project.name}`);
	if (test.info().retry != 0) {
		console.log(`Running ${test.info().retry}. retry of "${test.info().title}" in ${test.info().project.name}`);
	}
	id = uuidv4();
});

test(
	'Blueprint can be added via templates and removed',
	{
		tag: [
			'@all-browsers',
			'@sbox',
			'@standalone',
			'@component=blueprint-component-declarations-service',
			'@component=blueprint-component-passcode-settings',
			'@component=blueprint-components-registry-service',
			'@component=blueprint-management-service',
			'@component=blueprints',
			'@scenario_owner=ocean',
		],
	},
	async ({ page, baseURL }) => {
		const sboxSteps = new SboxSetupSteps(page);
		const blueprintSteps = new BlueprintsSteps(page);
		const blueprintTemplatePageSteps = new BlueprintTemplatePageSteps(page);
		const blueprintDetailPageSteps = new BlueprintDetailPageSteps(page);
		const navigationSteps = new NavigationSteps(page);

		await sboxSteps.sboxIsSetUp(baseURL!, clusterUrl);
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
	}
);

test(
	'Configuration of component can be updated',
	{
		tag: [
			'@all-browsers',
			'@sbox',
			'@standalone',
			'@component=blueprint-component-declarations-service',
			'@component=blueprint-component-disk-management',
			'@component=blueprint-components-registry-service',
			'@component=blueprint-management-service',
			'@component=blueprints',
			'@scenario_owner=ocean',
		],
	},
	async ({ page, baseURL }) => {
		const sboxSteps = new SboxSetupSteps(page);
		const blueprintSteps = new BlueprintsSteps(page);
		const blueprintDetailPageSteps = new BlueprintDetailPageSteps(page);
		await sboxSteps.sboxIsSetUp(baseURL!, clusterUrl);

		await blueprintSteps.adminClicksCreateBlueprintButton();

		await blueprintDetailPageSteps.changeBlueprintName('Disk_' + id);
		await blueprintDetailPageSteps.changeBlueprintDescription('Some description');

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
		await blueprintDetailPageSteps.selectedDiskManagementIsChecked('NetworkStorage.Included');
		await blueprintDetailPageSteps.adminsClicksOnCancelButton();

		await blueprintDetailPageSteps.adminDeletesBlueprint();
		await blueprintSteps.thereIsNoBlueprintWithName('Disk_' + id);
	}
);

test(
	'Components of blueprint can be updated',
	{
		tag: [
			'@all-browsers',
			'@sbox',
			'@standalone',
			'@component=blueprint-component-declarations-service',
			'@component=blueprint-component-disk-management',
			'@component=blueprint-component-passcode-settings',
			'@component=blueprint-components-registry-service',
			'@component=blueprint-management-service',
			'@component=blueprints',
			'@scenario_owner=ocean',
		],
	},
	async ({ page, browserName, baseURL }) => {
		test.fixme(browserName === 'webkit', 'To unblock releases for now');

		const sboxSteps = new SboxSetupSteps(page);
		const blueprintSteps = new BlueprintsSteps(page);
		const blueprintDetailPageSteps = new BlueprintDetailPageSteps(page);
		const navigationSteps = new NavigationSteps(page);
		await sboxSteps.sboxIsSetUp(baseURL!, clusterUrl);

		await blueprintSteps.adminClicksCreateBlueprintButton();

		await blueprintDetailPageSteps.changeBlueprintName('Disk_' + id);
		await blueprintDetailPageSteps.changeBlueprintDescription('Some description');

		await blueprintDetailPageSteps.adminSearchesForComponent('Disk management');
		await blueprintDetailPageSteps.onlyOneBlueprintComponentIsDisplayedWithTitle('Disk Management Policy');

		await blueprintDetailPageSteps.adminOpensAddModalOfComponent('Disk management');
		await blueprintDetailPageSteps.diskManagementDrawerIsOpened();

		await blueprintDetailPageSteps.adminAddsConfigurationOfComponent();

		await navigationSteps.adminsOpensBlueprintsRoute();
		await blueprintSteps.adminOpensBlueprintWithName('Disk_' + id);

		await blueprintDetailPageSteps.adminSearchesForComponent('Passcode Policy');
		await blueprintDetailPageSteps.onlyOneBlueprintComponentIsDisplayedWithTitle('Passcode Policy');

		await blueprintDetailPageSteps.adminOpensAddModalOfComponent('Passcode Policy');

		await blueprintDetailPageSteps.passcodeAddModalIsOpened();
		await blueprintDetailPageSteps.adminAddsConfigurationOfComponent();

		await blueprintDetailPageSteps.adminDeletesComponent('Disk management');

		await blueprintDetailPageSteps.adminDeletesBlueprint();
		await blueprintSteps.thereIsNoBlueprintWithName('Disk_' + id);
	}
);

test(
	'Blueprint templates can be filtered',
	{
		tag: [
			'@all-browsers',
			'@sbox',
			'@standalone',
			'@component=blueprint-component-declarations-service',
			'@component=blueprint-component-passcode-settings',
			'@component=blueprint-components-registry-service',
			'@component=blueprint-management-service',
			'@component=blueprints',
			'@scenario_owner=ocean',
		],
	},
	async ({ page, baseURL }) => {
		const sboxSteps = new SboxSetupSteps(page);
		const blueprintSteps = new BlueprintsSteps(page);
		const blueprintTemplatePageSteps = new BlueprintTemplatePageSteps(page);
		const navigationSteps = new NavigationSteps(page);
		await sboxSteps.sboxIsSetUp(baseURL!, clusterUrl);

		await navigationSteps.adminsOpensTemplatesRoute();
		await blueprintSteps.moreThanOneBlueprintTemplateIsDisplayed();

		await blueprintSteps.adminSearchesForBlueprintTemplate('Set passcode policies');
		await blueprintSteps.onlyOneBlueprintTemplateIsDisplayedWithTitle('Set passcode policies');

		await blueprintTemplatePageSteps.adminOpensTemplateWithName('Set passcode policies');
		await blueprintTemplatePageSteps.generalPageIsOpen();
	}
);

test(
	'Blueprints can be filtered',
	{
		tag: [
			'@all-browsers',
			'@sbox',
			'@standalone',
			'@component=blueprint-components-registry-service',
			'@component=blueprint-management-service',
			'@component=blueprints',
			'@scenario_owner=ocean',
		],
	},
	async ({ page, baseURL }) => {
		const sboxSteps = new SboxSetupSteps(page);
		const blueprintSteps = new BlueprintsSteps(page);
		const navigationSteps = new NavigationSteps(page);
		const blueprintDetailPageSteps = new BlueprintDetailPageSteps(page);
		await sboxSteps.sboxIsSetUp(baseURL!, clusterUrl);

		await blueprintSteps.adminClicksCreateBlueprintButton();

		await blueprintDetailPageSteps.changeBlueprintName('Blueprint_' + id);

		await navigationSteps.adminsOpensBlueprintsRoute();
		await blueprintSteps.adminClicksCreateBlueprintButton();

		await blueprintDetailPageSteps.changeBlueprintName('Blueprint2_' + id);

		await navigationSteps.adminsOpensBlueprintsRoute();
		await blueprintSteps.adminSearchesForBlueprint('Blueprint2_' + id);
		await blueprintSteps.thereIsNoBlueprintWithName('Blueprint_' + id);
		await blueprintSteps.onlyOneBlueprintIsDisplayedWithName('Blueprint2_' + id);

		await navigationSteps.adminsOpensBlueprintsRoute();
		await blueprintSteps.adminOpensBlueprintWithName('Blueprint_' + id);
		await blueprintDetailPageSteps.adminDeletesBlueprint();
		await blueprintSteps.thereIsNoBlueprintWithName('Blueprint_' + id);

		await blueprintSteps.adminOpensBlueprintWithName('Blueprint2_' + id);
		await blueprintDetailPageSteps.adminDeletesBlueprint();
		await blueprintSteps.thereIsNoBlueprintWithName('Blueprint2_' + id);
	}
);

test(
	'Available components of blueprint can be filtered',
	{
		tag: [
			'@all-browsers',
			'@sbox',
			'@standalone',
			'@component=blueprint-component-declarations-service',
			'@component=blueprint-component-disk-management',
			'@component=blueprint-components-registry-service',
			'@component=blueprint-management-service',
			'@component=blueprints',
			'@scenario_owner=ocean',
		],
	},
	async ({ page, baseURL }) => {
		const sboxSteps = new SboxSetupSteps(page);
		const blueprintSteps = new BlueprintsSteps(page);
		const blueprintDetailPageSteps = new BlueprintDetailPageSteps(page);
		await sboxSteps.sboxIsSetUp(baseURL!, clusterUrl);

		await blueprintSteps.adminClicksCreateBlueprintButton();

		await blueprintDetailPageSteps.changeBlueprintName('Blueprint_' + id);
		await blueprintDetailPageSteps.adminSearchesForComponent('Disk');
		await blueprintDetailPageSteps.onlyOneBlueprintComponentIsDisplayedWithTitle('Disk Management Policy');

		await blueprintDetailPageSteps.adminDeletesBlueprint();
		await blueprintSteps.thereIsNoBlueprintWithName('Blueprint_' + id);
	}
);
