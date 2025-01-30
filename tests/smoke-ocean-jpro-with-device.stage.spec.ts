import { test } from '@playwright/test';
import { v4 as uuidv4 } from 'uuid';
import JProLoginSteps from './steps/jpro-login-steps';
import BlueprintsSteps from './steps/blueprints-steps';
import JProApiSteps from './steps/jpro-api-steps';
import MimicSteps from './steps/mimic-steps';

const baseUrl = 'https://vhdpsvhf.pyro.jamf.build/';

const id = uuidv4();

test.beforeEach(async () => {
	console.log(`Running "${test.info().title}" in ${test.info().project.name}`);
	if (test.info().retry != 0) {
		console.log(`Running ${test.info().retry}. retry of "${test.info().title}" in ${test.info().project.name}`);
	}
});

test('Deploy blueprint to mimic device in Jamf Pro', { tag: ['@stage', '@mimic'] }, async ({ page }) => {
	const jproLoginSteps = new JProLoginSteps(page);
	const blueprintsSteps = new BlueprintsSteps(page);
	const jproApiSteps = new JProApiSteps(baseUrl);
	const mimicSteps = new MimicSteps();

	const udid = await jproApiSteps.getMobileDeviceUdid();

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
