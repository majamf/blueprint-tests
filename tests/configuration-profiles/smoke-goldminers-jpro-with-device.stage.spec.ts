import { test } from '@playwright/test';
import { v4 as uuidv4 } from 'uuid';
import JProLoginSteps from '../steps/jpro-login-steps';
import BlueprintsSteps from '../steps/blueprints-steps';
import JProApiSteps from '../steps/jpro-api-steps';
import MimicSteps from '../steps/mimic-steps';
import BlueprintDetailPageSteps from '../steps/blueprint-detail-page-steps';
import NavigationSteps from '../steps/navigation-steps';

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
	'Deploy blueprint containing config profile component to mimic device in Jamf Pro',
	{ tag: ['@stage', '@mimic'] },
	async ({ page, browserName }) => {
		// eslint-disable-next-line playwright/no-skipped-test
		test.skip(browserName !== 'chromium', 'Enough to run in one browser');
		const jproLoginSteps = new JProLoginSteps(page);
		const blueprintsSteps = new BlueprintsSteps(page);
		const blueprintDetailPageSteps = new BlueprintDetailPageSteps(page);
		const navigationSteps = new NavigationSteps(page);
		const jproApiSteps = new JProApiSteps(baseUrl);
		const mimicSteps = new MimicSteps();

		const udid = await jproApiSteps.getMobileDeviceUdid();
		const blueprintName = `Blueprint_with_CP_e2e_${id}`;

		await jproLoginSteps.loginToJamfProCached(baseUrl);
		await navigationSteps.adminOpensBlueprintsViaJamfProNavigation();
		await blueprintsSteps.blueprintsPageIsOpen();
		await blueprintsSteps.adminOpensBlueprintBuilder();
		await navigationSteps.newBlueprintModalIsOpen();
		await blueprintsSteps.adminFillsNameOfBlueprint(blueprintName);
		await blueprintsSteps.adminFillsDescriptionOfBlueprint('e2e automated test');
		const blueprintId = await blueprintsSteps.adminClicksCreateBlueprintButton();

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
