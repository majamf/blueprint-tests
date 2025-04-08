import { request } from '@playwright/test';

type ListResponse<T> = {
	devices: T[];
};

type MobileDeviceDetails = {
	UDID: string;
	lastCheckin: Date;
};

export default class JSchoolClient {
	constructor(
		private readonly baseUrl: string,
		private readonly username: string,
		private readonly password: string
	) {
		this.baseUrl = baseUrl;
		this.username = username;
		this.password = password;
	}

	private async fetchData(apiUrl: string) {
		const authString = `${this.username}:${this.password}`;
		const encodedAuthString = Buffer.from(authString).toString('base64');
		const headers = {
			Accept: 'application/json',
			Authorization: `Basic ${encodedAuthString}`,
		};

		const context = await request.newContext();
		const response = await context.get(apiUrl, { headers: headers, failOnStatusCode: true });
		return await response.json();
	}

	public async getMobileDevicesDetails(): Promise<ListResponse<MobileDeviceDetails>> {
		const apiUrl = encodeURI(`${this.baseUrl}api/devices`);
		return await this.fetchData(apiUrl);
	}
}
