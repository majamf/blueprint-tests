import { v4 as uuidv4 } from 'uuid';
import BlueprintsSteps from '../steps/blueprints-steps';
import MimicSteps from '../steps/mimic-steps';
import JSchoolLoginSteps from '../steps/jschool-login-steps';
import JSchoolApiSteps from '../steps/jschool-api-steps';
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
	'Deploy blueprint to mimic device in Jamf School',
	{
		tag: [
			'@chrome',
			'@stage',
			'@school',
			'@mimic',
			'@component=blueprint-component-declarations-service',
			'@component=blueprint-component-passcode-settings',
			'@component=blueprint-components-registry-service',
			'@component=blueprint-deployment-service',
			'@component=blueprint-management-service',
			'@component=blueprint-report-aggregation-service',
			'@component=blueprint-reporting-service',
			'@component=blueprints',
			'@component=jamf-school-core',
			'@component=scoping',
			'@component=scoping-engine',
			'@scenario_owner=ocean',
		],
		annotation: {
			type: 'note',
			description: 'Not executed in all browsers due to nature of the test and high flakiness caused by mimic',
		},
	},
	async ({ page, baseURL, accountCredentials, apiCredentials }) => {
		test.fixme(true, 'https://jamf.atlassian.net/browse/SCH-24654');

		const jSchoolLoginSteps = new JSchoolLoginSteps(page);
		const blueprintsSteps = new BlueprintsSteps(page);
		const blueprintTemplatePageSteps = new BlueprintTemplatePageSteps(page);
		const blueprintDetailPageSteps = new BlueprintDetailPageSteps(page);
		const navigationSteps = new NavigationSteps(page);
		const jSchoolApiSteps = new JSchoolApiSteps(baseURL!, apiCredentials!);
		const mimicSteps = new MimicSteps();

		const udid = await jSchoolApiSteps.getMobileDeviceUdid();

		await jSchoolLoginSteps.loginToJamfSchool(baseURL!, accountCredentials!);

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

		await blueprintDetailPageSteps.thereAreDeployedDevicesInAnalytics(1);

		await blueprintDetailPageSteps.adminDeletesBlueprint();
		await blueprintsSteps.thereIsNoBlueprintWithName('Passcode_' + id);
	}
);
