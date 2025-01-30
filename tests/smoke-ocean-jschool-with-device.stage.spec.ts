import { test } from '@playwright/test';
import { v4 as uuidv4 } from 'uuid';
import BlueprintsSteps from './steps/blueprints-steps';
import MimicSteps from './steps/mimic-steps';
import JSchoolLoginSteps from './steps/jschool-login-steps';
import JSchoolApiSteps from './steps/jschool-api-steps';

const baseUrl = 'https://oceanplaywrightstage.dev.jamfnimbus.cloud/';

let id = uuidv4();

test.beforeEach(async () => {
	console.log(`Running "${test.info().title}" in ${test.info().project.name}`);
	if (test.info().retry != 0) {
		console.log(`Running ${test.info().retry}. retry of "${test.info().title}" in ${test.info().project.name}`);
	}
	id = uuidv4();
});

test('Deploy blueprint to mimic device in Jamf School', { tag: ['@stage', '@mimic'] }, async ({ page }) => {
	test.fixme(true, 'https://jamfpdd.atlassian.net/browse/SCH-18401');
	const jSchoolLoginSteps = new JSchoolLoginSteps(page);
	const blueprintsSteps = new BlueprintsSteps(page);
	const jSchoolApiSteps = new JSchoolApiSteps(baseUrl);
	const mimicSteps = new MimicSteps();

	const udid = await jSchoolApiSteps.getMobileDeviceUdid();

	await jSchoolLoginSteps.loginToJamfSchool(baseUrl);

	await blueprintsSteps.adminOpensBlueprintsViaJamfSchoolNavigation();
	await blueprintsSteps.blueprintsPageIsOpen();

	await blueprintsSteps.adminsClicksOnQuickStart();

	await blueprintsSteps.adminOpensTemplateWithName('Set passcode policies');

	await blueprintsSteps.generalPageIsOpen();
	await blueprintsSteps.adminFillsNameOfBlueprint('Passcode_' + id);

	await blueprintsSteps.adminFillsDescriptionOfBlueprint('Some description');
	await blueprintsSteps.adminClicksNextButton();

	await blueprintsSteps.scopingPageIsOpen();
	await blueprintsSteps.adminSelectsGroupWithNameInScope('mimic device');
	await blueprintsSteps.adminClicksNextButton();

	await blueprintsSteps.passcodePolicyPageIsOpen();
	await blueprintsSteps.adminSelectsPasswordToBeRequired();
	const blueprintId = await blueprintsSteps.adminsSavesBlueprint();

	await blueprintsSteps.adminGoesBackToBlueprintsListViaBreadCrumbsInJPro();
	await blueprintsSteps.thereIsBlueprintWithName('Passcode_' + id);
	await blueprintsSteps.adminOpensBlueprintWithName('Passcode_' + id);

	await blueprintsSteps.adminDeploysBlueprint();

	await mimicSteps.blueprintIsDeployedToMimicDevice(blueprintId, udid, 'com.apple.configuration.passcode.settings');

	await blueprintsSteps.adminDeletesBlueprint();
	await blueprintsSteps.thereIsNoBlueprintWithName('Passcode_' + id);
});
