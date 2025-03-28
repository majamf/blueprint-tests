import 'jsr:@std/dotenv/load';

type TenantResponse = {
	tenantId: string;
};

type Blueprint = {
	id: string;
	updated: string;
};

type BlueprintsResponse = {
	results: Blueprint[];
};

type TokenResponse = {
	access_token: string;
};

const JPRO_API_URL = Deno.env.get('JAMF_PRO_BASE_URL') || 'https://vhdpsvhf.pyro.jamf.build';
const JPRO_USERNAME = Deno.env.get('JAMF_PRO_STAGE_API_USERNAME');
const JPRO_PASSWORD = Deno.env.get('JAMF_PRO_STAGE_API_PASSWORD');
const TYK_URL = 'https://tyk-gateway.stage.apigw.jamfnebula.com';
const TYK_CLIENT_ID = Deno.env.get('API_GATEWAY_STAGE_CLIENT_ID');
const TYK_CLIENT_SECRET = Deno.env.get('API_GATEWAY_STAGE_CLIENT_SECRET');
const BLUEPRINT_URL = 'https://us.int.stage.apigw.jamfnebula.com';

class APIClient {
	private async handleRequest<T>(request: Promise<Response>, errorContext: string): Promise<T> {
		const response = await request;

		if (response.status === 204) {
			return {} as T;
		}

		const data = await response.json();

		if (!response.ok) {
			console.error('Request failed with details:', {
				status: response.status,
				statusText: response.statusText,
				data,
				headers: Object.fromEntries(response.headers.entries()),
			});
			throw new Error(`${errorContext}: HTTP ${response.status} - ${response.statusText}`);
		}

		return data as T;
	}

	async getJProAuthToken(): Promise<string> {
		console.log('Attempting to authenticate with Jamf Pro...');
		const authUrl = `${JPRO_API_URL}/api/v1/auth/token`;

		const authString = `${JPRO_USERNAME}:${JPRO_PASSWORD}`;
		const encodedAuth = btoa(authString);

		console.log('Using API URL:', authUrl);

		const response = await this.handleRequest<{ token: string }>(
			fetch(authUrl, {
				method: 'POST',
				headers: {
					Accept: 'application/json',
					Authorization: `Basic ${encodedAuth}`,
				},
			}),
			'JPro authentication failed'
		);
		return response.token;
	}

	async getTykAuthToken(tenantId: string): Promise<string> {
		console.log('Attempting to authenticate with Tyk...');
		const authUrl = `${TYK_URL}/m2m/realms/platform/protocol/openid-connect/token`;
		console.log('Using API URL:', authUrl);

		const formData = new URLSearchParams({
			grant_type: 'client_credentials',
			client_id: TYK_CLIENT_ID!,
			client_secret: TYK_CLIENT_SECRET!,
			scope: 'blueprint-management-api-product default-plan tenant',
		});

		const response = await this.handleRequest<TokenResponse>(
			fetch(authUrl, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
					tenantId: tenantId,
				},
				body: formData.toString(),
			}),
			'Tyk authentication failed'
		);

		if (!response.access_token) {
			throw new Error('No access token received in response');
		}
		return response.access_token;
	}

	async getTenantId(token: string): Promise<string> {
		const response = await this.handleRequest<TenantResponse>(
			fetch(`${JPRO_API_URL}/api/v1/csa/tenant-id`, {
				headers: {
					Accept: 'application/json',
					Authorization: `Bearer ${token}`,
				},
			}),
			'Failed to get tenant ID'
		);

		if (!response.tenantId) {
			throw new Error('Tenant ID not found in response');
		}
		console.log('Tenant ID:', response.tenantId);
		return response.tenantId;
	}

	async getBlueprints(token: string): Promise<Blueprint[]> {
		const response = await this.handleRequest<BlueprintsResponse>(
			fetch(`${BLUEPRINT_URL}/blueprints/management/v1/blueprints?page=0&page-size=10000`, {
				headers: {
					Accept: 'application/json',
					Authorization: `Bearer ${token}`,
				},
			}),
			'Failed to fetch blueprints'
		);

		return response.results;
	}

	async deleteBlueprint(token: string, blueprintId: string): Promise<void> {
		console.log(`Attempting to delete blueprint: ${blueprintId}`);
		await this.handleRequest(
			fetch(`${BLUEPRINT_URL}/blueprints/management/v1/blueprints/${blueprintId}`, {
				method: 'DELETE',
				headers: {
					Accept: 'application/json',
					Authorization: `Bearer ${token}`,
				},
			}),
			`Failed to delete blueprint ${blueprintId}`
		);
		console.log(`Successfully deleted blueprint: ${blueprintId}`);
	}
}

class BlueprintManager {
	private readonly api: APIClient;

	constructor(api: APIClient) {
		this.api = api;
	}

	static getOldBlueprints(blueprints: Blueprint[], daysOld: number): string[] {
		const filterDate = new Date();
		filterDate.setDate(filterDate.getDate() - daysOld);

		return blueprints.filter((blueprint) => new Date(blueprint.updated) < filterDate).map((blueprint) => blueprint.id);
	}

	async cleanupOldBlueprints(daysOld = 7): Promise<void> {
		const failures: Array<{ id: string; error: string }> = [];
		console.log('Starting blueprint cleanup...');

		const jproToken = await this.api.getJProAuthToken();
		const tenantId = await this.api.getTenantId(jproToken);
		const tykToken = await this.api.getTykAuthToken(tenantId);

		const blueprints = await this.api.getBlueprints(tykToken);
		let oldBlueprintIds = BlueprintManager.getOldBlueprints(blueprints, daysOld);

		console.log(`Found ${oldBlueprintIds.length} blueprints older than ${daysOld} days:`);
		console.log(oldBlueprintIds);

		if (oldBlueprintIds.length > 0) {
			console.log('Starting deletion of old blueprints...');
			for (const blueprintId of oldBlueprintIds) {
				await this.api.deleteBlueprint(tykToken, blueprintId).catch((error: Error) => {
					failures.push({
						id: blueprintId,
						error: error instanceof Error ? error.message : String(error),
					});
				});
			}
			console.log('Finished processing all blueprint deletions');
			if (failures.length > 0) {
				console.error('\nThe following blueprints failed to delete:');
				failures.forEach((failure) => {
					console.error(`- Blueprint ${failure.id}: ${failure.error}`);
				});
				throw new Error(`Failed to delete ${failures.length} blueprint(s)`);
			}
		} else {
			console.log('No old blueprints to delete');
		}
	}
}

if (import.meta.main) {
	const manager = new BlueprintManager(new APIClient());

	manager.cleanupOldBlueprints().catch((error: Error) => {
		console.error('Error:', error.message);
		Deno.exit(1);
	});
}
