import { v4 as uuidv4 } from 'uuid';
import JProLoginSteps from '../steps/jpro-login-steps';
import BlueprintsSteps from '../steps/blueprints-steps';
import JProApiSteps from '../steps/jpro-api-steps';
import MimicSteps from '../steps/mimic-steps';
import BlueprintDetailPageSteps from '../steps/blueprint-detail-page-steps';
import NavigationSteps from '../steps/navigation-steps';
import { test } from '../utils/utils';

let id = uuidv4();

test.beforeEach(async () => {
	console.log(`Running "${test.info().title}" in ${test.info().project.name}`);
	if (test.info().retry != 0) {
		console.log(`Running ${test.info().retry}. retry of "${test.info().title}" in ${test.info().project.name}`);
	}
	id = uuidv4();
});

test(
	'Deploy blueprint containing config profile component to mimic device in Jamf Pro',
	{
		tag: ['@chrome', '@stage', '@pro', '@mimic'],
		annotation: {
			type: 'note',
			description: 'Not executed in all browsers due to nature of the test and high flakiness caused by mimic',
		},
	},
	async ({ page, baseURL, accountCredentials, apiCredentials }, workerInfo) => {
		const jproLoginSteps = new JProLoginSteps(page);
		const blueprintsSteps = new BlueprintsSteps(page);
		const blueprintDetailPageSteps = new BlueprintDetailPageSteps(page);
		const navigationSteps = new NavigationSteps(page);
		const jproApiSteps = new JProApiSteps(baseURL!, apiCredentials!);
		const mimicSteps = new MimicSteps();

		const udid = await jproApiSteps.getMobileDeviceUdid();
		const blueprintName = `Blueprint_with_CP_e2e_${id}`;

		await jproLoginSteps.loginToJamfProCached(baseURL!, accountCredentials!, workerInfo);
		await navigationSteps.adminOpensBlueprintsViaJamfProNavigation();
		await blueprintsSteps.blueprintsPageIsOpen();
		const blueprintId = await blueprintsSteps.adminClicksCreateBlueprintButton();
		await blueprintDetailPageSteps.changeBlueprintName(blueprintName);
		await blueprintDetailPageSteps.changeBlueprintDescription('e2e automated test');

		await blueprintDetailPageSteps.blueprintWithNameIsOpened(blueprintName);
		await blueprintDetailPageSteps.adminWaitsForToastToDisappear('Blueprint created');
		await blueprintDetailPageSteps.adminOpensAddModalOfComponent('Lock Screen Message');
		await blueprintDetailPageSteps.configProfileComponentDrawerIsOpened('Lock Screen Message');
		await blueprintDetailPageSteps.adminClicksOnGivenCheckbox('AssetTagInformation');
		await blueprintDetailPageSteps.adminAddsConfigurationOfComponent();
		await blueprintDetailPageSteps.blueprintIsNotReadyForDeploymentInAnalyticsCard();
		await blueprintDetailPageSteps.adminOpensScopeDrawer();
		await blueprintDetailPageSteps.scopingDrawerIsOpened();
		await blueprintDetailPageSteps.adminSelectsGroupWithNameInScope('mimic device');
		await blueprintDetailPageSteps.adminSavesScope();
		await blueprintDetailPageSteps.blueprintIsReadyForDeploymentInAnalyticsCard();
		await blueprintDetailPageSteps.adminDeploysBlueprint();
		await mimicSteps.blueprintIsDeployedToMimicDeviceViaJamfPro(blueprintId, udid, 'com.apple.configuration.legacy');

		await blueprintDetailPageSteps.adminReloadsTheBlueprintDetailsPage();
		await blueprintDetailPageSteps.blueprintWithNameIsOpened(blueprintName);
		await blueprintDetailPageSteps.thereAreDeployedDevicesInAnalytics(1);

		await blueprintDetailPageSteps.adminDeletesBlueprint();
		await blueprintsSteps.thereIsNoBlueprintWithName(blueprintName);
	}
);

test(
	'Deploy untitled blueprint containing config profile component to mimic device in Jamf Pro',
	{
		tag: ['@chrome', '@stage', '@pro', '@mimic'],
		annotation: {
			type: 'note',
			description: 'Not executed in all browsers due to nature of the test and high flakiness caused by mimic',
		},
	},
	async ({ page, baseURL, accountCredentials, apiCredentials }, workerInfo) => {
		const jproLoginSteps = new JProLoginSteps(page);
		const blueprintsSteps = new BlueprintsSteps(page);
		const blueprintDetailPageSteps = new BlueprintDetailPageSteps(page);
		const navigationSteps = new NavigationSteps(page);
		const jproApiSteps = new JProApiSteps(baseURL!, apiCredentials!);
		const mimicSteps = new MimicSteps();

		const udid = await jproApiSteps.getMobileDeviceUdid();

		await jproLoginSteps.loginToJamfProCached(baseURL!, accountCredentials!, workerInfo);
		await navigationSteps.adminOpensBlueprintsViaJamfProNavigation();
		await blueprintsSteps.blueprintsPageIsOpen();
		const blueprintId = await blueprintsSteps.adminClicksCreateBlueprintButton();

		await blueprintDetailPageSteps.blueprintWithNameIsOpened('Untitled blueprint');
		await blueprintDetailPageSteps.adminWaitsForToastToDisappear('Blueprint created');
		await blueprintDetailPageSteps.adminOpensAddModalOfComponent('Lock Screen Message');
		await blueprintDetailPageSteps.configProfileComponentDrawerIsOpened('Lock Screen Message');
		await blueprintDetailPageSteps.adminClicksOnGivenCheckbox('AssetTagInformation');
		await blueprintDetailPageSteps.adminAddsConfigurationOfComponent();
		await blueprintDetailPageSteps.blueprintIsNotReadyForDeploymentInAnalyticsCard();
		await blueprintDetailPageSteps.adminOpensScopeDrawer();
		await blueprintDetailPageSteps.scopingDrawerIsOpened();
		await blueprintDetailPageSteps.adminSelectsGroupWithNameInScope('mimic device');
		await blueprintDetailPageSteps.adminSavesScope();
		await blueprintDetailPageSteps.blueprintIsReadyForDeploymentInAnalyticsCard();
		await blueprintDetailPageSteps.adminDeploysBlueprint();
		await mimicSteps.blueprintIsDeployedToMimicDeviceViaJamfPro(blueprintId, udid, 'com.apple.configuration.legacy');

		await blueprintDetailPageSteps.adminReloadsTheBlueprintDetailsPage();
		await blueprintDetailPageSteps.blueprintWithNameIsOpened('Untitled blueprint');
		await blueprintDetailPageSteps.thereAreDeployedDevicesInAnalytics(1);

		await blueprintDetailPageSteps.adminDeletesBlueprint();
		await blueprintsSteps.thereIsNoBlueprintWithName('Untitled blueprint');
	}
);
