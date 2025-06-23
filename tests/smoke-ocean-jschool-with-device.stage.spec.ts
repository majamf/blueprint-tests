import { test } from '@playwright/test';
import { v4 as uuidv4 } from 'uuid';
import BlueprintsSteps from './steps/blueprints-steps';
import MimicSteps from './steps/mimic-steps';
import JSchoolLoginSteps from './steps/jschool-login-steps';
import JSchoolApiSteps from './steps/jschool-api-steps';
import BlueprintTemplatePageSteps from './steps/blueprint-template-page-steps';
import BlueprintDetailPageSteps from './steps/blueprint-detail-page-steps';
import NavigationSteps from './steps/navigation-steps';

const baseUrl = 'https://oceanplaywrightstage.dev.jamfnimbus.cloud/';

let id = uuidv4();

test.beforeEach(async () => {
	console.log(`Running "${test.info().title}" in ${test.info().project.name}`);
	if (test.info().retry != 0) {
		console.log(`Running ${test.info().retry}. retry of "${test.info().title}" in ${test.info().project.name}`);
	}
	id = uuidv4();
});

test('Deploy blueprint to mimic device in Jamf School', { tag: ['@stage', '@school', '@mimic'] }, async ({ page }) => {
	const jSchoolLoginSteps = new JSchoolLoginSteps(page);
	const blueprintsSteps = new BlueprintsSteps(page);
	const blueprintTemplatePageSteps = new BlueprintTemplatePageSteps(page);
	const blueprintDetailPageSteps = new BlueprintDetailPageSteps(page);
	const navigationSteps = new NavigationSteps(page);
	const jSchoolApiSteps = new JSchoolApiSteps(baseUrl);
	const mimicSteps = new MimicSteps();

	const udid = await jSchoolApiSteps.getMobileDeviceUdid();

	await jSchoolLoginSteps.loginToJamfSchool(baseUrl);

	await navigationSteps.adminOpensBlueprintsViaJamfSchoolNavigation();
	await blueprintsSteps.blueprintsPageIsOpen();

	await blueprintsSteps.adminsClicksOnQuickStart();

	await blueprintTemplatePageSteps.adminOpensTemplateWithName('Set passcode policies');

	await blueprintTemplatePageSteps.generalPageIsOpen();
	await blueprintTemplatePageSteps.adminFillsNameOfBlueprint('Passcode_' + id);

	await blueprintTemplatePageSteps.adminFillsDescriptionOfBlueprint('Some description');
	await blueprintTemplatePageSteps.adminClicksNextButton();

	await blueprintTemplatePageSteps.scopingPageIsOpen();
	await blueprintTemplatePageSteps.adminSelectsGroupWithNameInScope('mimic device');
	await blueprintTemplatePageSteps.adminClicksNextButton();

	await blueprintTemplatePageSteps.passcodePolicyPageIsOpen();
	await blueprintTemplatePageSteps.adminSelectsPasswordToBeRequired();
	const blueprintId = await blueprintTemplatePageSteps.adminsSavesBlueprint();

	await blueprintDetailPageSteps.blueprintWithNameIsOpened('Passcode_' + id);

	await blueprintDetailPageSteps.adminWaitsForToastToDisappear('Blueprint created');

	await navigationSteps.adminGoesBackToBlueprintsListViaBreadCrumbsInJamfSchool();
	await blueprintsSteps.thereIsBlueprintWithName('Passcode_' + id);
	await blueprintsSteps.adminOpensBlueprintWithName('Passcode_' + id);

	await blueprintDetailPageSteps.adminDeploysBlueprint();

	await mimicSteps.blueprintIsDeployedToMimicDeviceViaJamfSchool(
		blueprintId,
		udid,
		'com.apple.configuration.passcode.settings'
	);

	await blueprintDetailPageSteps.adminReloadsTheBlueprintDetailsPage();

	await blueprintDetailPageSteps.blueprintWithNameIsOpened('Passcode_' + id);

	await blueprintDetailPageSteps.thereAreDeployedDevicesInAnalytics(1);
	await blueprintDetailPageSteps.thereArePendingDevicesInAnalytics(0);
	await blueprintDetailPageSteps.thereAreErrorDevicesInAnalytics(0);

	await blueprintDetailPageSteps.adminDeletesBlueprint();
	await blueprintsSteps.thereIsNoBlueprintWithName('Passcode_' + id);
});
