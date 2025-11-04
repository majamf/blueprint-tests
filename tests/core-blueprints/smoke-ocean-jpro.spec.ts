import { v4 as uuidv4 } from 'uuid';
import JProLoginSteps from '../steps/jpro-login-steps';
import BlueprintsSteps from '../steps/blueprints-steps';
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
	'Blueprints list is loaded in Jamf Pro',
	{ tag: ['@all-browsers', '@dev', '@stage', '@pro'] },
	async ({ page, baseURL, accountCredentials }) => {
		const jproLoginSteps = new JProLoginSteps(page);
		const blueprintsSteps = new BlueprintsSteps(page);
		const navigationSteps = new NavigationSteps(page);

		await jproLoginSteps.loginToJamfProCached(baseURL!, accountCredentials!);

		await navigationSteps.adminOpensBlueprintsViaJamfProNavigation();
		await blueprintsSteps.blueprintsPageIsOpen();

		await blueprintsSteps.thereIsAtLeastOneCard();
	}
);

test(
	'Blueprint can be added via templates and removed in Jamf Pro',
	{ tag: ['@all-browsers', '@dev', '@stage', '@pro'] },
	async ({ page, baseURL, accountCredentials }) => {
		const jproLoginSteps = new JProLoginSteps(page);
		const blueprintsSteps = new BlueprintsSteps(page);
		const blueprintTemplatePageSteps = new BlueprintTemplatePageSteps(page);
		const blueprintDetailPageSteps = new BlueprintDetailPageSteps(page);
		const navigationSteps = new NavigationSteps(page);

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
		await blueprintTemplatePageSteps.adminSelectsFirstGroupInScope();
		await blueprintTemplatePageSteps.adminClicksNextButton();

		await blueprintTemplatePageSteps.passcodePolicyPageIsOpen();
		await blueprintTemplatePageSteps.adminSelectsPasswordToBeRequired();
		await blueprintTemplatePageSteps.adminsSavesBlueprint();

		await blueprintDetailPageSteps.blueprintWithNameIsOpened('Passcode_' + id);

		await blueprintDetailPageSteps.adminWaitsForToastToDisappear('Blueprint created');

		await navigationSteps.adminGoesBackToBlueprintsListViaBreadCrumbsInJPro();
		await blueprintsSteps.thereIsBlueprintWithName('Passcode_' + id);
		await blueprintsSteps.adminOpensBlueprintWithName('Passcode_' + id);

		await blueprintDetailPageSteps.adminDeletesBlueprint();
		await blueprintsSteps.thereIsNoBlueprintWithName('Passcode_' + id);
	}
);

test(
	'Blueprint can be added via builder and removed in Jamf Pro',
	{
		tag: ['@chrome', '@dev', '@stage', '@pro', '@pro-legacy'],
	},
	async ({ page, browserName, baseURL, accountCredentials }) => {
		test.fixme(browserName === 'webkit' || browserName === 'firefox', 'https://jamfpdd.atlassian.net/browse/JSC-62590');

		const jproLoginSteps = new JProLoginSteps(page);
		const blueprintsSteps = new BlueprintsSteps(page);
		const blueprintDetailPageSteps = new BlueprintDetailPageSteps(page);
		const navigationSteps = new NavigationSteps(page);

		await jproLoginSteps.loginToJamfProCached(baseURL!, accountCredentials!);

		await navigationSteps.adminOpensBlueprintsViaJamfProNavigation();
		await blueprintsSteps.blueprintsPageIsOpen();

		await blueprintsSteps.adminClicksCreateBlueprintButton();

		await blueprintDetailPageSteps.blueprintWithNameIsOpened('Untitled blueprint');

		await blueprintDetailPageSteps.adminWaitsForToastToDisappear('Blueprint created');

		await blueprintDetailPageSteps.changeBlueprintName('Disk_' + id);

		await blueprintDetailPageSteps.adminSearchesForComponent('Disk management');
		await blueprintDetailPageSteps.onlyOneBlueprintComponentIsDisplayedWithTitle('Disk Management Policy');

		// No real clue why, but it is needed to close the navigation modal for DnD to work properly in Jamf Pro
		await navigationSteps.adminClosesJamfProNavigation();

		await blueprintDetailPageSteps.adminDragsAndDropsComponent('Disk management');

		await blueprintDetailPageSteps.adminOpensConfigurationOfComponent('Disk management');

		await blueprintDetailPageSteps.diskManagementDrawerIsOpened();
		await blueprintDetailPageSteps.adminClicksOnExternalStorageCheckbox();
		await blueprintDetailPageSteps.adminSavesConfigurationOfComponent();

		await blueprintDetailPageSteps.adminOpensScopeDrawer();
		await blueprintDetailPageSteps.scopingDrawerIsOpened();

		await blueprintDetailPageSteps.adminSelectsFirstGroupInScopeModal();
		await blueprintDetailPageSteps.adminSavesScope();

		await navigationSteps.adminGoesBackToBlueprintsListViaBreadCrumbsInJPro();

		await blueprintsSteps.thereIsBlueprintWithName('Disk_' + id);
		await blueprintsSteps.adminOpensBlueprintWithName('Disk_' + id);

		await blueprintDetailPageSteps.adminDeletesBlueprint();
		await blueprintsSteps.thereIsNoBlueprintWithName('Disk_' + id);
	}
);

test(
	'Templates are properly loaded',
	{ tag: ['@all-browsers', '@dev', '@stage', '@pro'] },
	async ({ page, baseURL, accountCredentials }) => {
		const jproLoginSteps = new JProLoginSteps(page);
		const blueprintsSteps = new BlueprintsSteps(page);
		const navigationSteps = new NavigationSteps(page);

		await jproLoginSteps.loginToJamfProCached(baseURL!, accountCredentials!);

		await navigationSteps.adminOpensBlueprintsViaJamfProNavigation();
		await blueprintsSteps.blueprintsPageIsOpen();

		await blueprintsSteps.adminsClicksOnQuickStart();
		await blueprintsSteps.verifyExpectedTemplates('Set passcode policies');
	}
);

test(
	'Searching in scope works',
	{ tag: ['@all-browsers', '@dev', '@stage', '@pro', '@pro-legacy'] },
	async ({ page, baseURL, accountCredentials }) => {
		const jproLoginSteps = new JProLoginSteps(page);
		const blueprintsSteps = new BlueprintsSteps(page);
		const blueprintDetailPageSteps = new BlueprintDetailPageSteps(page);
		const navigationSteps = new NavigationSteps(page);

		await jproLoginSteps.loginToJamfProCached(baseURL!, accountCredentials!);

		await navigationSteps.adminOpensBlueprintsViaJamfProNavigation();
		await blueprintsSteps.blueprintsPageIsOpen();

		await blueprintsSteps.adminClicksCreateBlueprintButton();

		await blueprintDetailPageSteps.changeBlueprintName('Search_test' + id);

		await blueprintDetailPageSteps.adminOpensScopeDrawer();
		await blueprintDetailPageSteps.scopingDrawerIsOpened();

		await blueprintDetailPageSteps.adminSearchesForGroupInScopeDrawer('All Managed Clients');

		await blueprintDetailPageSteps.adminsClicksOnCancelButton();

		await blueprintDetailPageSteps.adminDeletesBlueprint();
		await blueprintsSteps.thereIsNoBlueprintWithName('Search_test' + id);
	}
);
