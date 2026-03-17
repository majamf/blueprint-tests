import { request } from '@playwright/test';

type ListResponse<T> = {
	results: T[];
};

type MobileDeviceDetails = {
	general: {
		udid: string;
	};
};

type ComputerDetails = {
	general: {
		managementId: string;
	};
};

type Section = Uppercase<keyof MobileDeviceDetails>;

export default class JproClient {
	constructor(
		private readonly baseUrl: string,
		private readonly username: string,
		private readonly password: string
	) {
		this.baseUrl = baseUrl;
		this.username = username;
		this.password = password;
	}

	private async getAuthToken() {
		const authUrl = this.baseUrl + '/api/v1/auth/token';

		const authString = `${this.username}:${this.password}`;
		const encodedAuthString = Buffer.from(authString).toString('base64');

		const headers = {
			Accept: 'application/json',
			Authorization: `Basic ${encodedAuthString}`,
		};

		const context = await request.newContext();
		const authResponse = await context.post(authUrl, { headers: headers, failOnStatusCode: true });
		const authData = await authResponse.json();

		return authData.token;
	}

	private async fetchData(apiUrl: string) {
		const context = await request.newContext();
		const token = await this.getAuthToken();

		const headers = {
			accept: 'application/json',
			Authorization: `Bearer ${token}`,
		};
		const response = await context.get(apiUrl, { headers, failOnStatusCode: true });
		return await response.json();
	}

	public async getMobileDevicesDetails(section: Section = 'GENERAL'): Promise<ListResponse<MobileDeviceDetails>> {
		const apiUrl = encodeURI(`${this.baseUrl}/api/v2/mobile-devices/detail?section=${section}`);
		return await this.fetchData(apiUrl);
	}

	public async getComputerDetails(section: Section = 'GENERAL'): Promise<ListResponse<ComputerDetails>> {
		const apiUrl = encodeURI(`${this.baseUrl}/api/v3/computers-inventory?section=${section}`);
		return await this.fetchData(apiUrl);
	}

	public async getDeclarationStatusItems(deviceUUID: string, key: string): Promise<string> {
		const apiUrl = encodeURI(`${this.baseUrl}/api/v1/ddm/${deviceUUID}/status-items/${key}`);
		return await this.fetchData(apiUrl);
	}
}
