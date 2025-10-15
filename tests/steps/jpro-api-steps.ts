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
}
