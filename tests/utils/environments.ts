import 'dotenv/config';
import type { AccountCredentials, ApiCredentials } from './utils';

export const standardEnvironmentTypes = ['dev', 'stage', 'prod'] as const;

export type StandardEnvironmentType = (typeof standardEnvironmentTypes)[number];

export type Environment = {
	url: string;
	accountCredentials: AccountCredentials;
	apiCredentials: ApiCredentials;
};

export type ProEnvironmentType = 'develop' | 'rc' | 'ga' | 'ga-1' | 'ga-2' | 'asyncDeployment';

export type ProEnvironments = {
	[env in ProEnvironmentType]?: Environment;
};

export type StandardEnvironment = {
	school?: Environment;
	pro: ProEnvironments;
};

export type CustomEnvironment = {
	pro?: Environment;
	school?: Environment;
};

export type StandaloneEnvironment = {
	url: string;
};

export type SboxEnvironment = {
	standalone?: StandaloneEnvironment;
};

export type Environments = {
	[env in StandardEnvironmentType]: StandardEnvironment;
} & {
	custom: CustomEnvironment;
	sbox: SboxEnvironment;
};

function getEnvVariable(name: string): string {
	if (process.env[name]) {
		return process.env[name];
	}

	throw new Error('Environment variable ' + name + ' is not set');
}

function makeEnvironment(envPrefix: string): Environment | undefined {
	const url = process.env[`${envPrefix}_BASE_URL`];
	if (url == null) {
		return undefined;
	}

	return {
		url,
		accountCredentials: {
			email: getEnvVariable(`${envPrefix}_ACCOUNT_EMAIL`),
			password: getEnvVariable(`${envPrefix}_ACCOUNT_PASSWORD`),
		},
		apiCredentials: {
			username: getEnvVariable(`${envPrefix}_API_USERNAME`),
			password: getEnvVariable(`${envPrefix}_API_PASSWORD`),
		},
	};
}

function makeStandaloneEnvironment(envPrefix: string): StandaloneEnvironment | undefined {
	const url = process.env[`${envPrefix}_BASE_URL`];
	if (url == null) {
		return undefined;
	}

	return {
		url
	}
}

const proPrefix = 'JAMF_PRO';
const schoolPrefix = 'JAMF_SCHOOL';

function makeProEnvironments(standardEnv: StandardEnvironmentType): ProEnvironments {
	const suffix = standardEnv.toUpperCase();

	return {
		develop: makeEnvironment(`${proPrefix}_${suffix}`),
		rc: makeEnvironment(`${proPrefix}_RC_${suffix}`),
		ga: makeEnvironment(`${proPrefix}_GA_${suffix}`),
		'ga-1': makeEnvironment(`${proPrefix}_GA_1_${suffix}`),
		'ga-2': makeEnvironment(`${proPrefix}_GA_2_${suffix}`),
		asyncDeployment: makeEnvironment(`${proPrefix}_ASYNC_DEPLOYMENT_${suffix}`),
	};
}

function makeStandardEnvironment(standardEnv: StandardEnvironmentType): StandardEnvironment {
	return {
		school: makeEnvironment(`${schoolPrefix}_${standardEnv.toUpperCase()}`),
		pro: makeProEnvironments(standardEnv),
	};
}

export const environments: Environments = {
	custom: {
		school: makeEnvironment(`${schoolPrefix}_CUSTOM`),
		pro: makeEnvironment(`${proPrefix}_CUSTOM`),
	},
	sbox: {
		standalone: makeStandaloneEnvironment('STANDALONE_SBOX'),
	},
	dev: makeStandardEnvironment('dev'),
	stage: makeStandardEnvironment('stage'),
	prod: makeStandardEnvironment('prod'),
};
