import 'dotenv/config';
import type { AccountCredentials, ApiCredentials } from './utils';

export const standardEnvironmentTypes = ['dev', 'stage', 'prod'] as const;

export type StandardEnvironmentType = (typeof standardEnvironmentTypes)[number];

export type Environment = {
	url: string;
	accountCredentials: AccountCredentials;
	apiCredentials: ApiCredentials;
};

export type StandardEnvironment = {
	school?: Environment;
	pro: {
		current?: Environment;
		n1?: Environment;
		n2?: Environment;
		asyncDeployment?: Environment;
	};
};

export type CustomEnvironment = {
	pro?: Environment;
	school?: Environment;
};

export type SboxEnvironment = {
	standalone?: {
		url: string;
	};
};

export type Environments = {
	[env in StandardEnvironmentType]: StandardEnvironment;
} & {
	custom: CustomEnvironment;
	sbox: SboxEnvironment;
};

function getEnvVariable(name: string, defaultValue?: string): string {
	if (process.env[name]) {
		return process.env[name];
	}

	if (defaultValue) {
		return defaultValue;
	}

	throw new Error('Environment variable ' + name + ' is not set');
}

type DeepPartial<T> = T extends object
	? {
			[P in keyof T]?: DeepPartial<T[P]>;
		}
	: T;

function makeEnvironment(envPrefix: string, defaults?: DeepPartial<Environment>): Environment | undefined {
	const url = process.env[`${envPrefix}_BASE_URL`] ?? defaults?.url;
	if (url == null) {
		return undefined;
	}

	return {
		url,
		accountCredentials: {
			email: getEnvVariable(`${envPrefix}_ACCOUNT_EMAIL`, defaults?.accountCredentials?.email),
			password: getEnvVariable(`${envPrefix}_ACCOUNT_PASSWORD`, defaults?.accountCredentials?.password),
		},
		apiCredentials: {
			username: getEnvVariable(`${envPrefix}_API_USERNAME`, defaults?.apiCredentials?.username),
			password: getEnvVariable(`${envPrefix}_API_PASSWORD`, defaults?.apiCredentials?.password),
		},
	};
}

export const environments: Environments = {
	custom: {
		school: makeEnvironment('JAMF_SCHOOL_CUSTOM'),
		pro: makeEnvironment('JAMF_PRO_CUSTOM'),
	},
	sbox: {
		standalone: {
			url: getEnvVariable('SBOX_BASE_URL', 'https://blueprints.sbox-mfe.jamf.io'),
		},
	},
	dev: {
		school: makeEnvironment('JAMF_SCHOOL_DEV'),
		pro: {
			current: makeEnvironment('JAMF_PRO_DEV'),
			asyncDeployment: makeEnvironment('JAMF_PRO_ASYNC_DEPLOYMENT_DEV'),
			n1: makeEnvironment('JAMF_PRO_N1_DEV'),
			n2: makeEnvironment('JAMF_PRO_N2_DEV'),
		},
	},
	stage: {
		school: makeEnvironment('JAMF_SCHOOL_STAGE', {
			url: 'https://oceanplaywrightstage.dev.jamfnimbus.cloud/',
			accountCredentials: {
				email: process.env.JAMF_ACCOUNT_STAGE_USER_MAIL,
				password: process.env.JAMF_ACCOUNT_STAGE_USER_PASSWORD,
			},
		}),
		pro: {
			current: makeEnvironment('JAMF_PRO_STAGE', {
				url: 'https://vhdpsvhf.pyro.jamf.build/',
				accountCredentials: {
					email: process.env.JAMF_ACCOUNT_STAGE_USER_MAIL,
					password: process.env.JAMF_ACCOUNT_STAGE_USER_PASSWORD,
				},
			}),
			asyncDeployment: makeEnvironment('JAMF_PRO_ASYNC_DEPLOYMENT_STAGE', {
				url: 'https://chgkmtjr.pyro.jamf.build/',
				apiCredentials: {
					username: process.env.JAMF_PRO_STAGE_API_USERNAME,
					password: process.env.JAMF_PRO_STAGE_API_PASSWORD,
				},
				accountCredentials: {
					email: process.env.JAMF_ACCOUNT_STAGE_USER_MAIL,
					password: process.env.JAMF_ACCOUNT_STAGE_USER_PASSWORD,
				},
			}),
			n1: makeEnvironment('JAMF_PRO_N1_STAGE'),
			n2: makeEnvironment('JAMF_PRO_N2_STAGE'),
		},
	},
	prod: {
		school: makeEnvironment('JAMF_SCHOOL_PROD'),
		pro: {
			current: makeEnvironment('JAMF_PRO_PROD'),
			asyncDeployment: makeEnvironment('JAMF_PRO_ASYNC_DEPLOYMENT_PROD'),
			n1: makeEnvironment('JAMF_PRO_N1_PROD'),
			n2: makeEnvironment('JAMF_PRO_N2_PROD'),
		},
	},
};
