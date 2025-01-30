import * as process from 'node:process';
import { assertEnvironmentVariable, Step } from '../utils/utils';
import JSchoolClient from '../api/jschool-client';
import { expect } from '@playwright/test';

export default class JSchoolApiSteps {
	private readonly jSchoolClient: JSchoolClient;

	constructor(private readonly baseUrl: string) {
		assertEnvironmentVariable(process.env.JAMF_SCHOOL_STAGE_API_USERNAME, 'JAMF_SCHOOL_STAGE_API_USERNAME');
		assertEnvironmentVariable(process.env.JAMF_SCHOOL_STAGE_API_PASSWORD, 'JAMF_SCHOOL_STAGE_API_PASSWORD');
		this.jSchoolClient = new JSchoolClient(
			baseUrl,
			process.env.JAMF_SCHOOL_STAGE_API_USERNAME,
			process.env.JAMF_SCHOOL_STAGE_API_PASSWORD
		);
	}

	@Step('Get mobile device udid')
	public async getMobileDeviceUdid() {
		const details = await this.jSchoolClient.getMobileDevicesDetails();

		expect(details.devices.length).toEqual(1);
		expect(details.devices[0]).not.toBeUndefined();

		return details.devices[0]!.UDID;
	}
}
