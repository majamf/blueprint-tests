import { test } from '@playwright/test';
import { v4 as uuidv4 } from 'uuid';
import JProLoginSteps from './steps/jpro-login-steps';
import BlueprintsSteps from './steps/blueprints-steps';
import JProApiSteps from './steps/jpro-api-steps';
import MimicSteps from './steps/mimic-steps';
import BlueprintTemplatePageSteps from './steps/blueprint-template-page-steps';
import BlueprintDetailPageSteps from './steps/blueprint-detail-page-steps';
import NavigationSteps from './steps/navigation-steps';

const baseUrl = process.env.JAMF_PRO_BASE_URL || 'https://vhdpsvhf.pyro.jamf.build/';

let id = uuidv4();

test.beforeEach(async () => {
	console.log(`Running "${test.info().title}" in ${test.info().project.name}`);
	if (test.info().retry != 0) {
		console.log(`Running ${test.info().retry}. retry of "${test.info().title}" in ${test.info().project.name}`);
	}
	id = uuidv4();
});

test('Deploy blueprint to mimic device in Jamf Pro', { tag: ['@stage', '@mimic'] }, async ({ page }) => {
	const jproLoginSteps = new JProLoginSteps(page);
	const blueprintsSteps = new BlueprintsSteps(page);
	const blueprintTemplatePageSteps = new BlueprintTemplatePageSteps(page);
	const blueprintDetailPageSteps = new BlueprintDetailPageSteps(page);
	const navigationSteps = new NavigationSteps(page);
	const jproApiSteps = new JProApiSteps(baseUrl);
	const mimicSteps = new MimicSteps();

	const udid = await jproApiSteps.getMobileDeviceUdid();

	await jproLoginSteps.loginToJamfPro(baseUrl);

	await navigationSteps.adminOpensBlueprintsViaJamfProNavigation();
	await blueprintsSteps.blueprintsPageIsOpen();

	await blueprintsSteps.adminsClicksOnQuickStart();

	await blueprintTemplatePageSteps.adminOpensTemplateWithName('Set passcode policies');

	await blueprintTemplatePageSteps.generalPageIsOpen();
	await blueprintsSteps.adminFillsNameOfBlueprint('Passcode_' + id);

	await blueprintsSteps.adminFillsDescriptionOfBlueprint('Some description');
	await blueprintTemplatePageSteps.adminClicksNextButton();

	await blueprintTemplatePageSteps.scopingPageIsOpen();
	await blueprintTemplatePageSteps.adminSelectsGroupWithNameInScope('mimic device');
	await blueprintTemplatePageSteps.adminClicksNextButton();

	await blueprintTemplatePageSteps.passcodePolicyPageIsOpen();
	await blueprintTemplatePageSteps.adminSelectsPasswordToBeRequired();
	const blueprintId = await blueprintTemplatePageSteps.adminsSavesBlueprint();

	await navigationSteps.adminGoesBackToBlueprintsListViaBreadCrumbsInJPro();
	await blueprintsSteps.thereIsBlueprintWithName('Passcode_' + id);
	await blueprintsSteps.adminOpensBlueprintWithName('Passcode_' + id);

	await blueprintDetailPageSteps.adminDeploysBlueprint();

	await mimicSteps.blueprintIsDeployedToMimicDevice(blueprintId, udid, 'com.apple.configuration.passcode.settings');

	await blueprintDetailPageSteps.adminDeletesBlueprint();
	await blueprintsSteps.thereIsNoBlueprintWithName('Passcode_' + id);
});
