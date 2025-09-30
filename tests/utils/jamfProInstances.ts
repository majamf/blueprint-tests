export const jamfProInstances = {
	current: process.env.JAMF_PRO_BASE_URL || 'https://vhdpsvhf.pyro.jamf.build/',
	asyncDeployment: process.env.JAMF_PRO_BASE_URL_ASYNC_DEPLOYMENT || 'https://chgkmtjr.pyro.jamf.build/',
};

export type JamfProInstanceKey = keyof typeof jamfProInstances;
