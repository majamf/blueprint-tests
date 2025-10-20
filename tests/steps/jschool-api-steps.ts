import { type ApiCredentials, Step } from '../utils/utils';
import JSchoolClient from '../api/jschool-client';
import { expect } from '@playwright/test';

const pollIntervals: number[] = [1_000, 2_000, 10_000];
const pollTimeout: number = 60_000;

export default class JSchoolApiSteps {
	private readonly jSchoolClient: JSchoolClient;

	constructor(baseUrl: string, { username, password }: ApiCredentials) {
		this.jSchoolClient = new JSchoolClient(baseUrl, username, password);
	}

	@Step('Get mobile device udid')
	public async getMobileDeviceUdid() {
		const details = await this.jSchoolClient.getMobileDevicesDetails();

		expect(details.devices.length).toEqual(1);
		expect(details.devices[0]).not.toBeUndefined();

		return details.devices[0]!.UDID;
	}

	@Step('Get device last checkin')
	public async getDeviceLastCheckin(): Promise<Date> {
		const details = await this.jSchoolClient.getMobileDevicesDetails();

		expect(details.devices.length).toEqual(1);
		expect(details.devices[0]).not.toBeUndefined();

		return new Date(details.devices[0]!.lastCheckin);
	}

	@Step('Wait for checkin of device in Jamf School')
	public async waitForCheckinOfDeviceInJamfSchool(time: Date) {
		await expect
			.poll(
				async () => {
					const lastCheckin: Date = await this.getDeviceLastCheckin();
					return lastCheckin.getTime();
				},
				{
					message: "Eventually device's last checkin is greater than " + time,
					intervals: pollIntervals,
					timeout: pollTimeout,
				}
			)
			.toBeGreaterThan(time.getTime());
	}
}
