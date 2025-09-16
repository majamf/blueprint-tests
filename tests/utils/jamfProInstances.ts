export const jamfProInstances = {
	current: process.env.JAMF_PRO_BASE_URL || 'https://vhdpsvhf.pyro.jamf.build/',
	current_n_1: process.env.JAMF_PRO_BASE_URL_N_1 || 'https://current-n-1.jamfpro.url/',
	current_n_2: process.env.JAMF_PRO_BASE_URL_N_2 || 'https://current-n-2.jamfpro.url/',
};

export type JamfProInstanceKey = keyof typeof jamfProInstances;
