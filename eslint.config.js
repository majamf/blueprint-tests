import playwrightConfig from 'eslint-plugin-playwright';
import eslintConfigPrettier from 'eslint-config-prettier';

export default [
	{
		...playwrightConfig.configs['flat/recommended'],
		files: ['tests/**.*'],
	},
	eslintConfigPrettier,
];
