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
	id: string;
	general: {
		managementId: string;
	};
};

type StaticComputerGroupSummary = {
	id: string;
	name: string;
};

type StaticComputerGroupSearchResults = {
	results: StaticComputerGroupSummary[];
};

type StaticComputerGroupHref = {
	id: string;
	href: string;
};

type StatusItem = {
	key: string;
	value: string;
	lastUpdateTime: string;
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

	private async postData(apiUrl: string, body: unknown) {
		const context = await request.newContext();
		const token = await this.getAuthToken();
		const headers = {
			accept: 'application/json',
			Authorization: `Bearer ${token}`,
		};
		const response = await context.post(apiUrl, { headers, data: body, failOnStatusCode: true });
		return await response.json();
	}

	private async putData(apiUrl: string, body: unknown) {
		const context = await request.newContext();
		const token = await this.getAuthToken();
		const headers = {
			accept: 'application/json',
			Authorization: `Bearer ${token}`,
		};
		const response = await context.put(apiUrl, { headers, data: body, failOnStatusCode: true });
		return await response.json();
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

	public async createStaticComputerGroup(name: string, assignments: string[] = []): Promise<StaticComputerGroupHref> {
		const apiUrl = `${this.baseUrl}/api/v2/computer-groups/static-groups`;
		return await this.postData(apiUrl, { name, assignments });
	}

	public async getStaticComputerGroupsByName(name: string): Promise<StaticComputerGroupSearchResults> {
		const apiUrl = encodeURI(`${this.baseUrl}/api/v2/computer-groups/static-groups?filter=name=="${name}"`);
		return await this.fetchData(apiUrl);
	}

	public async deleteStaticComputerGroup(groupId: string): Promise<void> {
		const context = await request.newContext();
		const token = await this.getAuthToken();
		const headers = { accept: 'application/json', Authorization: `Bearer ${token}` };
		await context.delete(`${this.baseUrl}/api/v2/computer-groups/static-groups/${groupId}`, {
			headers,
			failOnStatusCode: true,
		});
	}

	public async updateStaticComputerGroup(
		groupId: string,
		groupName: string,
		assignments: string[]
	): Promise<StaticComputerGroupSummary> {
		const apiUrl = `${this.baseUrl}/api/v2/computer-groups/static-groups/${groupId}`;
		return await this.putData(apiUrl, { name: groupName, assignments });
	}

	public async getDeclarationStatusItems(deviceUUID: string, key: string): Promise<StatusItem> {
		const apiUrl = encodeURI(`${this.baseUrl}/api/v1/ddm/${deviceUUID}/status-items/${key}`);
		return await this.fetchData(apiUrl);
	}
}
