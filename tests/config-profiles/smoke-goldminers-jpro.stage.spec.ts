import { test } from '@playwright/test';
import { v4 as uuidv4 } from 'uuid';

import BlueprintsSteps from '../steps/blueprints-steps';
import BlueprintDetailPageSteps from '../steps/blueprint-detail-page-steps';
import NavigationSteps from '../steps/navigation-steps';
import JProLoginSteps from '../steps/jpro-login-steps';

const baseUrl = process.env.JAMF_PRO_BASE_URL || 'https://vhdpsvhf.pyro.jamf.build/';

let id = uuidv4();

test.beforeEach(async () => {
	console.log(`Running "${test.info().title}" in ${test.info().project.name}`);
	if (test.info().retry != 0) {
		console.log(`Running ${test.info().retry}. retry of "${test.info().title}" in ${test.info().project.name}`);
	}
	id = uuidv4();
});

test(
	'Config profile component can be filtered by component name, key name and OS type',
	{ tag: ['@stage'] },
	async ({ page }) => {
		const jproLoginSteps = new JProLoginSteps(page);
		const blueprintsSteps = new BlueprintsSteps(page);
		const blueprintDetailPageSteps = new BlueprintDetailPageSteps(page);
		const navigationSteps = new NavigationSteps(page);
		const blueprintName = `Blueprint_with_CP_e2e_${id}`;

		await jproLoginSteps.loginToJamfPro(baseUrl);
		await navigationSteps.adminOpensBlueprintsViaJamfProNavigation();
		await blueprintsSteps.blueprintsPageIsOpen();
		await blueprintsSteps.adminOpensBlueprintBuilder();
		await navigationSteps.newBlueprintModalIsOpen();
		await blueprintsSteps.adminFillsNameOfBlueprint(blueprintName);
		await blueprintsSteps.adminFillsDescriptionOfBlueprint('e2e automated test');
		await blueprintsSteps.adminClicksCreateBlueprintButton();

		await blueprintDetailPageSteps.adminSearchesForComponent('Lock Screen Message');
		await blueprintDetailPageSteps.onlyOneBlueprintComponentIsDisplayedWithTitle('Lock Screen Message');

		await blueprintDetailPageSteps.adminOpensAddModalOfComponent('Lock Screen Message');
		await blueprintDetailPageSteps.configProfileComponentAddModalIsOpened('Lock Screen Message');
		await blueprintDetailPageSteps.adminSearchesForKeyInsideComponent('AssetTagInformation');
		await blueprintDetailPageSteps.onlyOneKeyIsDisplayedInsideComponent('Asset Tag');
		await blueprintDetailPageSteps.adminSearchesForKeyInsideComponent('');

		await blueprintDetailPageSteps.adminsClicksOnFiltersButton();
		await blueprintDetailPageSteps.adminSelectsFilterFromFiltersDropdown('macOS');
		await blueprintDetailPageSteps.adminsClicksOnFiltersButton();
		await blueprintDetailPageSteps.noPayloadKeyMatchesGivenFilterOption();
		await blueprintDetailPageSteps.adminsClicksOnFiltersButton();
		await blueprintDetailPageSteps.adminSelectsFilterFromFiltersDropdown('iOS');
		await blueprintDetailPageSteps.adminSelectsFilterFromFiltersDropdown('macOS');
		await blueprintDetailPageSteps.adminsClicksOnFiltersButton();
		await blueprintDetailPageSteps.givenNumberOfKeysAreDisplayedInsideComponent(3);
		await blueprintDetailPageSteps.adminsClicksOnCancelButton();

		await blueprintDetailPageSteps.adminDeletesBlueprint();
		await blueprintsSteps.thereIsNoBlueprintWithName(blueprintName);
	}
);

test('Config profile component can be updated', { tag: ['@stage'] }, async ({ page }) => {
	const jproLoginSteps = new JProLoginSteps(page);
	const blueprintsSteps = new BlueprintsSteps(page);
	const blueprintDetailPageSteps = new BlueprintDetailPageSteps(page);
	const navigationSteps = new NavigationSteps(page);
	const blueprintName = `Blueprint_with_CP_e2e_${id}`;


	await jproLoginSteps.loginToJamfPro(baseUrl);
	await navigationSteps.adminOpensBlueprintsViaJamfProNavigation();
	await blueprintsSteps.blueprintsPageIsOpen();
	await blueprintsSteps.adminOpensBlueprintBuilder();
	await navigationSteps.newBlueprintModalIsOpen();
	await blueprintsSteps.adminFillsNameOfBlueprint(blueprintName);
	await blueprintsSteps.adminFillsDescriptionOfBlueprint('e2e automated test');
	await blueprintsSteps.adminClicksCreateBlueprintButton();

	await blueprintDetailPageSteps.adminOpensAddModalOfComponent('Lock Screen Message');
	await blueprintDetailPageSteps.configProfileComponentAddModalIsOpened('Lock Screen Message');
	await blueprintDetailPageSteps.adminClicksOnGivenCheckbox('AssetTagInformation');
	await blueprintDetailPageSteps.adminFillsKeyInputFieldWithText('AssetTagInformation', 'firstInputTest');
	await blueprintDetailPageSteps.adminAddsConfigurationOfComponent();
	await blueprintDetailPageSteps.adminOpensConfigurationOfComponent('Lock Screen Message');
	await blueprintDetailPageSteps.configProfileComponentDrawerIsOpened('Lock Screen Message');
	await blueprintDetailPageSteps.selectedCheckboxIsChecked('AssetTagInformation');
	await blueprintDetailPageSteps.adminClicksOnGivenCheckbox('IfLostReturnToMessage');
	await blueprintDetailPageSteps.adminFillsKeyInputFieldWithText('IfLostReturnToMessage', 'secondInputTest');
	await blueprintDetailPageSteps.adminSavesConfigurationOfComponent();

	await blueprintDetailPageSteps.adminOpensConfigurationOfComponent('Lock Screen Message');
	await blueprintDetailPageSteps.configProfileComponentDrawerIsOpened('Lock Screen Message');
	await blueprintDetailPageSteps.selectedCheckboxIsChecked('AssetTagInformation');
	await blueprintDetailPageSteps.selectedCheckboxIsChecked('IfLostReturnToMessage');
	await blueprintDetailPageSteps.adminsClicksOnCloseButton();

	await blueprintDetailPageSteps.adminDeletesBlueprint();
	await blueprintsSteps.thereIsNoBlueprintWithName(blueprintName);
});
