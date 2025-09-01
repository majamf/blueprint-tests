import { defineConfig } from 'eslint/config';
import playwrightConfig from 'eslint-plugin-playwright';
import eslintConfigPrettier from 'eslint-config-prettier';
import typescriptConfig from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';

export default defineConfig([
	{
		...playwrightConfig.configs['flat/recommended'],
		files: ['tests/**.*', 'tests/**/**.*'],
		rules: {
			...playwrightConfig.configs['flat/recommended'].rules,
			'playwright/expect-expect': ['off'],
		},
		languageOptions: {
			parser: typescriptParser,
		},
	},
	eslintConfigPrettier,
	...typescriptConfig.configs['flat/recommended'],
]);
