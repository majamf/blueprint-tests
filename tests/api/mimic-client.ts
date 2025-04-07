import { request } from '@playwright/test';

export type Field =
	| {
			'com.jamfsoftware.mimic.asset.state.fields.declarativemanagement.DeclarativeManagementDeclarations': {
				value: {
					configurations: Record<
						string,
						{
							type: string[];
							identifier: string;
							active: boolean;
							valid: string;
						}
					>;
					activations: Record<
						string,
						{
							declarationIdentifiers: string;
							identifier: string;
							active: boolean;
							valid: string;
						}
					>;
				};
			};
	  }
	| {
			'com.jamfsoftware.mimic.asset.state.fields.MdmLostModeEnabled': {
				mdmLostModeEnabled: boolean;
			};
	  };

type DistributeKeys<T> = T extends any ? keyof T : never;
export type FieldName = DistributeKeys<Field>;
export type FieldRecord = {
	[K in FieldName]: Field extends infer U ? (U extends Record<K, any> ? U[K] : never) : never;
};
export type FieldType<T extends FieldName> = FieldRecord[T];

type Response = {
	fields: Field[];
};

export default class MimicClient {
	constructor(private readonly baseUrl: string) {
		this.baseUrl = baseUrl;
	}

	private async fetchData(apiUrl: string) {
		const context = await request.newContext();

		const headers = {
			accept: 'application/json',
		};
		const response = await context.get(apiUrl, { headers });
		return await response.json();
	}

	public async getDeviceInfo(udid: string): Promise<Response> {
		const apiUrl = encodeURI(`${this.baseUrl}devices/${udid}`);
		return await this.fetchData(apiUrl);
	}

	public async checkIn(udid: string) {
		const apiUrl = encodeURI(`${this.baseUrl}devices/${udid}/check-in`);
		const context = await request.newContext();

		const headers = {
			accept: 'application/json',
		};
		await context.get(apiUrl, { headers });
	}
}
