import { v4 as uuidv4 } from 'uuid';
import JProLoginSteps from '../steps/jpro-login-steps';
import BlueprintsSteps from '../steps/blueprints-steps';
import JProApiSteps from '../steps/jpro-api-steps';
import MimicSteps from '../steps/mimic-steps';
import BlueprintTemplatePageSteps from '../steps/blueprint-template-page-steps';
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
	'Deploy blueprint to mimic device in Jamf Pro',
	{
		tag: ['@chrome', '@dev', '@stage', '@pro', '@pro-legacy', '@mimic'],
		annotation: {
			type: 'note',
			description: 'Not executed in all browsers due to nature of the test and high flakiness caused by mimic',
		},
	},
	async ({ page, baseURL, accountCredentials, apiCredentials }) => {
		const jproLoginSteps = new JProLoginSteps(page);
		const blueprintsSteps = new BlueprintsSteps(page);
		const blueprintTemplatePageSteps = new BlueprintTemplatePageSteps(page);
		const blueprintDetailPageSteps = new BlueprintDetailPageSteps(page);
		const navigationSteps = new NavigationSteps(page);
		const jproApiSteps = new JProApiSteps(baseURL!, apiCredentials!);
		const mimicSteps = new MimicSteps();

		const udid = await jproApiSteps.getMobileDeviceUdid();

		await jproLoginSteps.loginToJamfProCached(baseURL!, accountCredentials!);

		await navigationSteps.adminOpensBlueprintsViaJamfProNavigation();
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

		await navigationSteps.adminGoesBackToBlueprintsListViaBreadCrumbsInJPro();
		await blueprintsSteps.thereIsBlueprintWithName('Passcode_' + id);
		await blueprintsSteps.adminOpensBlueprintWithName('Passcode_' + id);

		await blueprintDetailPageSteps.adminDeploysBlueprint();

		await mimicSteps.blueprintIsDeployedToMimicDeviceViaJamfPro(
			blueprintId,
			udid,
			'com.apple.configuration.passcode.settings'
		);

		await blueprintDetailPageSteps.adminReloadsTheBlueprintDetailsPage();

		await blueprintDetailPageSteps.blueprintWithNameIsOpened('Passcode_' + id);

		await blueprintDetailPageSteps.thereAreDeployedDevicesInAnalytics(1);

		await blueprintDetailPageSteps.adminDeletesBlueprint();
		await blueprintsSteps.thereIsNoBlueprintWithName('Passcode_' + id);
	}
);
