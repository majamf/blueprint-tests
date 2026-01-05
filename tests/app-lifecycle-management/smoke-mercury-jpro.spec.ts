import JProLoginSteps from '../steps/jpro-login-steps';
import BlueprintsSteps from '../steps/blueprints-steps';
import BlueprintDetailPageSteps from '../steps/blueprint-detail-page-steps.ts';
import NavigationSteps from '../steps/navigation-steps';
import { test } from '../utils/utils';
import JProApiSteps from '../steps/jpro-api-steps.ts';
import { expect } from '@playwright/test';


test.beforeEach(async () => {
	console.log(`Running "${test.info().title}" in ${test.info().project.name}`);
	if (test.info().retry != 0) {
		console.log(`Running ${test.info().retry}. retry of "${test.info().title}" in ${test.info().project.name}`);
	}
});


test(
	'ALME Application can be added via blueprint in Jamf Pro and deployed to a computer device',
	{
		tag: [
			'@chrome',
			'@stage',
			'@pro',
			'@component=blueprint-component-declarations-service',
			'@component=blueprint-component-passcode-settings',
			'@component=blueprint-components-registry-service',
			'@component=blueprint-management-service',
			'@component=blueprints',
			'@component=jamf-pro-server',
			'@component=scoping',
			'@component=scoping-engine',
			'@scenario_owner=mercury',
		],
	},
	async ({ page, baseURL, accountCredentials, apiCredentials }, workerInfo) => {
		const jproLoginSteps = new JProLoginSteps(page);
		const blueprintsSteps = new BlueprintsSteps(page);
		const navigationSteps = new NavigationSteps(page);
		const blueprintDetailPageSteps = new BlueprintDetailPageSteps(page);
		const jproApiSteps = new JProApiSteps(baseURL!, apiCredentials!);

		await jproLoginSteps.loginToJamfPro(baseURL!, accountCredentials!);

		await navigationSteps.adminOpensBlueprintsViaJamfProNavigation();
		await blueprintsSteps.blueprintsPageIsOpen();

		const blueprintId = await blueprintsSteps.adminClicksCreateBlueprintButton();
		const computerManagementId = await jproApiSteps.getComputerManagementId();

		await blueprintDetailPageSteps.adminDragsAndDropsComponent('Amazon AWS VPN Client');

		await blueprintDetailPageSteps.adminOpensScopeDrawer();
		await blueprintDetailPageSteps.scopingDrawerIsOpened();
		await blueprintDetailPageSteps.adminSelectsGroupWithNameInScope('All Managed Clients');
		await blueprintDetailPageSteps.adminSavesScope();

		await blueprintDetailPageSteps.blueprintIsReadyForDeploymentInAnalyticsCard();

		await blueprintDetailPageSteps.adminDeploysBlueprint();


		const deployedDeclarations = await jproApiSteps.getDeclarationItemDetails(
			computerManagementId,
			'management.declarations.activations',
			`Blueprint_${blueprintId}_s1_sys_act1`
		);

		expect(deployedDeclarations).not.toEqual({});

		await blueprintDetailPageSteps.thereAreDeployedDevicesInAnalytics(1);

	}
);


