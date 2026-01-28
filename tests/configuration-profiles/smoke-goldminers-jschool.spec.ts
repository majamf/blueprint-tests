import { v4 as uuidv4 } from 'uuid';
import BlueprintsSteps from '../steps/blueprints-steps';
import BlueprintDetailPageSteps from '../steps/blueprint-detail-page-steps';
import NavigationSteps from '../steps/navigation-steps';
import JSchoolLoginSteps from '../steps/jschool-login-steps';
import { test } from '../utils/utils';

let id = uuidv4();

test.beforeEach(async () => {
	console.log(`Running "${test.info().title}" in ${test.info().project.name}`);
	if (test.info().retry != 0) {
		console.log(`Running ${test.info().retry}. retry of "${test.info().title}" in ${test.info().project.name}`);
	}
	id = uuidv4();
});

test.skip(
	'Config profile component can be filtered by component name, key name and OS type in Jamf School',
	{
		tag: [
			'@all-browsers',
			'@stage',
			'@school',
			'@component=blueprint-component-configuration-profiles',
            '@component=configuration-profile-service',
			'@component=blueprint-components-registry-service',
			'@component=blueprint-management-service',
			'@component=blueprints',
            '@component=jamf-school-core',
			'@scenario_owner=goldminers',
		],
	},
	async ({ page, baseURL, accountCredentials }) => {
        const jSchoolLoginSteps = new JSchoolLoginSteps(page);
        const blueprintsSteps = new BlueprintsSteps(page);
		const blueprintDetailPageSteps = new BlueprintDetailPageSteps(page);
		const navigationSteps = new NavigationSteps(page);
		const blueprintName = `Blueprint_with_CP_e2e_${id}`;

		await jSchoolLoginSteps.loginToJamfSchool(baseURL!, accountCredentials!);
		await navigationSteps.adminOpensBlueprintsViaJamfSchoolNavigation();
		await blueprintsSteps.blueprintsPageIsOpen();
		await blueprintsSteps.adminClicksCreateBlueprintButton();
		await blueprintDetailPageSteps.adminWaitsForToastToDisappear('Blueprint created');
		await blueprintDetailPageSteps.changeBlueprintName(blueprintName);
		await blueprintDetailPageSteps.changeBlueprintDescription('e2e automated test');

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

test.skip(
	'Config profile component can be updated in Jamf School',
	{
		tag: [
			'@all-browsers',
			'@stage',
			'@school',
			'@component=blueprint-component-configuration-profiles',
            '@component=configuration-profile-service',
			'@component=blueprint-components-registry-service',
			'@component=blueprint-management-service',
			'@component=blueprints',
            '@component=jamf-school-core',
			'@scenario_owner=goldminers',
		],
	},
	async ({ page, baseURL, accountCredentials }) => {
		const jSchoolLoginSteps = new JSchoolLoginSteps(page);
        const blueprintsSteps = new BlueprintsSteps(page);
		const blueprintDetailPageSteps = new BlueprintDetailPageSteps(page);
		const navigationSteps = new NavigationSteps(page);
		const blueprintName = `Blueprint_with_CP_e2e_${id}`;

		await jSchoolLoginSteps.loginToJamfSchool(baseURL!, accountCredentials!);
		await navigationSteps.adminOpensBlueprintsViaJamfSchoolNavigation();
		await blueprintsSteps.blueprintsPageIsOpen();
		await blueprintsSteps.adminClicksCreateBlueprintButton();
		await blueprintDetailPageSteps.adminWaitsForToastToDisappear('Blueprint created');
		await blueprintDetailPageSteps.blueprintWithNameIsOpened('Untitled blueprint');
		await blueprintDetailPageSteps.changeBlueprintName(blueprintName);
		await blueprintDetailPageSteps.changeBlueprintDescription('e2e automated test');

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
		await blueprintDetailPageSteps.adminsClicksOnDiscardChangesButton();

		await blueprintDetailPageSteps.adminDeletesBlueprint();
		await blueprintsSteps.thereIsNoBlueprintWithName(blueprintName);
	}
);
