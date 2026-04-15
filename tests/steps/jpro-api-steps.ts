import { type ApiCredentials, Step } from '../utils/utils';
import JproClient from '../api/jpro-client';
import { expect } from '@playwright/test';

export default class JProApiSteps {
	private readonly jproClient: JproClient;

	constructor(baseUrl: string, { username, password }: ApiCredentials) {
		this.jproClient = new JproClient(baseUrl, username, password);
	}

	@Step('Get mobile device udid')
	public async getMobileDeviceUdid() {
		const details = await this.jproClient.getMobileDevicesDetails();

		expect(details.results.length).toEqual(1);
		expect(details.results[0]).not.toBeUndefined();

		return details.results[0]!.general.udid;
	}

	@Step('Get computer managementId')
	public async getComputerManagementId() {
		const details = await this.jproClient.getComputerDetails();

		expect(details.results.length).toEqual(1);
		expect(details.results[0]).not.toBeUndefined();

		return details.results[0]!.general.managementId;
	}

	@Step('Get computer Jamf Pro id')
	public async getComputerJproId() {
		const details = await this.jproClient.getComputerDetails();

		expect(details.results.length).toEqual(1);
		expect(details.results[0]).not.toBeUndefined();

		return details.results[0]!.id;
	}

	@Step('Create static computer group')
	public async createStaticComputerGroup(groupName: string, computerId: string): Promise<void> {
		await this.jproClient.createStaticComputerGroup(groupName, [computerId]);
	}

	@Step('Delete static computer group')
	public async deleteStaticComputerGroup(groupName: string): Promise<void> {
		const groups = await this.jproClient.getStaticComputerGroupsByName(groupName);

		expect(groups.results[0]).not.toBeUndefined();

		await this.jproClient.deleteStaticComputerGroup(groups.results[0]!.id);
	}

	@Step('Add computer to static group')
	public async addComputerToStaticGroup(groupName: string, computerId: string): Promise<void> {
		const groups = await this.jproClient.getStaticComputerGroupsByName(groupName);

		// expect(groups.results.length).toEqual(1);
		expect(groups.results[0]).not.toBeUndefined();

		await this.jproClient.updateStaticComputerGroup(groups.results[0]!.id, groupName, [computerId]);
	}

	@Step('Get real device declaration details')
	public async getDeclarationItemDetails(
		computerManagementId: string,
		key: string,
		blueprintId: string
	): Promise<{ declaration?: string }> {
		const maxAttempts = 30;
		const delayMs = 1000;

		for (let attempt = 1; attempt <= maxAttempts; attempt++) {
			try {
				const declarationStatusItems = await this.jproClient.getDeclarationStatusItems(computerManagementId, key);
				const valueString: string = declarationStatusItems.value;
				const declarations: string[] = valueString
					.split('},{')
					.map((item: string): string => item.replace(/[{}]/g, ''));

				const declaration = declarations.find(
					(declStr: string): boolean => declStr.includes(`identifier=${blueprintId}`) && declStr.includes('valid=valid')
				);

				if (declaration) {
					console.log(`Found declaration on attempt ${attempt}: ${declaration}`);
					return { declaration };
				}
			} catch (error) {
				console.log(`Attempt ${attempt} failed:`, error);
			}

			if (attempt < maxAttempts) {
				await new Promise<void>((resolve) => setTimeout(resolve, delayMs));
			}
		}

		return {};
	}
}
