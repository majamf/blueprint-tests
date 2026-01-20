import 'jsr:@std/dotenv/load';
import { type Environment, environments } from '../../tests/utils/environments.ts';

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

// it is not possible to retrieve tenantId from Jamf School API
// tenantID related to instance: https://oceanplaywrightstage.dev.jamfnimbus.cloud
const JSCHOOL_TENANTID = 'e4f64d69-fca7-4e72-ac8d-80a0c0c3d832';

const TYK_URL = 'https://us.int.stage.apigw.jamfnebula.com';
const TYK_CLIENT_ID = Deno.env.get('API_GATEWAY_STAGE_CLIENT_ID');
const TYK_CLIENT_SECRET = Deno.env.get('API_GATEWAY_STAGE_CLIENT_SECRET');

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

	async getJProAuthToken({ url, apiCredentials: { username, password } }: Environment): Promise<string> {
		console.log('Attempting to authenticate with Jamf Pro...');
		const authUrl = `${url}/api/v1/auth/token`;

		const authString = `${username}:${password}`;
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

	async getJProTenantId({ url }: Environment, token: string): Promise<string> {
		const response = await this.handleRequest<TenantResponse>(
			fetch(`${url}/api/v1/csa/tenant-id`, {
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
			fetch(`${TYK_URL}/blueprints/management/v1/blueprints?page=0&page-size=10000`, {
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
			fetch(`${TYK_URL}/blueprints/management/v1/blueprints/${blueprintId}`, {
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

	private static getOldBlueprints(blueprints: Blueprint[], daysOld: number): string[] {
		const filterDate = new Date();
		filterDate.setDate(filterDate.getDate() - daysOld);

		return blueprints.filter((blueprint) => new Date(blueprint.updated) < filterDate).map((blueprint) => blueprint.id);
	}

	private static getJamfProEnvironments() {
		console.log('Retrieving Jamf Pro environments from configuration...');
		return Object.entries(environments.stage.pro)
			.map(([key, value]) => [key, value] as const)
			.filter(([, env]) => !!env?.url);
	}

	private async cleanupOldBlueprints(tykToken: string, daysOld: number): Promise<void> {
		const failures: Array<{ id: string; error: string }> = [];

		const blueprints = await this.api.getBlueprints(tykToken);
		const oldBlueprintIds = BlueprintManager.getOldBlueprints(blueprints, daysOld);

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

	async cleanupOldBlueprintsInJamfPro(daysOld = 7): Promise<void> {
		console.log('Starting Jamf Pro blueprint cleanup...');
		const errors: Error[] = [];
		for (const [key, env] of BlueprintManager.getJamfProEnvironments()) {
			await this.processJamfProInstance(key, env, daysOld).catch((error: Error) => {
				console.error(`Error processing Jamf Pro instance ${key}:`, error.message);
				errors.push(new Error(`Instance ${key}: ${error.message}`));
			});
		}
		if (errors.length > 0) {
			throw new AggregateError(errors, `Jamf Pro cleanup completed with ${errors.length} error(s)`);
		}
	}

	private async processJamfProInstance(key: string, env: Environment, daysOld = 7): Promise<void> {
		console.log(`Processing Jamf Pro instance: ${key} (${env.url})`);
		const jproToken = await this.api.getJProAuthToken(env);
		const tenantId = await this.api.getJProTenantId(env, jproToken);
		const tykToken = await this.api.getTykAuthToken(tenantId);

		await this.cleanupOldBlueprints(tykToken, daysOld);
	}

	async cleanupOldBlueprintsInJamfSchool(daysOld = 7): Promise<void> {
		console.log('Starting Jamf School blueprint cleanup...');

		const tykToken = await this.api.getTykAuthToken(JSCHOOL_TENANTID);

		await this.cleanupOldBlueprints(tykToken, daysOld);
	}
}

if (import.meta.main) {
	const manager = new BlueprintManager(new APIClient());
	const errors: Error[] = [];

	await manager.cleanupOldBlueprintsInJamfPro().catch((aggregateErrors: AggregateError) => {
		console.log(aggregateErrors.message);
		for (const error of aggregateErrors.errors) {
			console.error('Jamf Pro Cleanup Error:', error.message);
			errors.push(error);
		}
	});

	await manager.cleanupOldBlueprintsInJamfSchool().catch((error: Error) => {
		console.error('Jamf School Cleanup Error:', error.message);
		errors.push(error);
	});

	if (errors.length > 0) {
		console.error(`Script completed with ${errors.length} error(s)`);
		Deno.exit(1);
	} else {
		console.log('All cleanup operations completed successfully');
		Deno.exit(0);
	}
}
