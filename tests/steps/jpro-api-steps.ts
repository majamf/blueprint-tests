import * as process from 'node:process';
import { assertEnvironmentVariable, Step } from '../utils/utils';
import JproClient from '../api/jpro-client';
import { expect } from '@playwright/test';

export default class JProApiSteps {
	private readonly jproClient: JproClient;

	constructor(private readonly baseUrl: string) {
		assertEnvironmentVariable(process.env.JAMF_PRO_STAGE_API_USERNAME, 'JAMF_PRO_STAGE_API_USERNAME');
		assertEnvironmentVariable(process.env.JAMF_PRO_STAGE_API_PASSWORD, 'JAMF_PRO_STAGE_API_PASSWORD');
		this.jproClient = new JproClient(
			baseUrl,
			process.env.JAMF_PRO_STAGE_API_USERNAME,
			process.env.JAMF_PRO_STAGE_API_PASSWORD
		);
	}

	@Step('Get mobile device udid')
	public async getMobileDeviceUdid() {
		const details = await this.jproClient.getMobileDevicesDetails();

		expect(details.results.length).toEqual(1);
		expect(details.results[0]).not.toBeUndefined();

		return details.results[0]!.general.udid;
	}
}
