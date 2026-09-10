import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import svelte from 'eslint-plugin-svelte';
import globals from 'globals';
import ts from 'typescript-eslint';
import svelteConfig from './svelte.config.js';

export default ts.config(
	js.configs.recommended,
	...ts.configs.recommended,
	...svelte.configs.recommended,
	prettier,
	...svelte.configs.prettier,
	{
		languageOptions: {
			globals: { ...globals.browser, ...globals.node }
		},
		rules: {
			// TypeScript resolves globals (including the ambient types in src/global.d.ts)
			'no-undef': 'off',
			// The app is served from the root, so there is no base path to resolve against
			'svelte/no-navigation-without-resolve': 'off',
			// These Maps are local scratch data, not reactive state
			'svelte/prefer-svelte-reactivity': 'off',
			// Writing to a $bindable() prop is the point of it, not a dead store
			'no-useless-assignment': 'off',
			'@typescript-eslint/no-explicit-any': 'warn'
		}
	},
	{
		files: ['**/*.svelte', '**/*.svelte.ts'],
		languageOptions: {
			parserOptions: {
				projectService: true,
				extraFileExtensions: ['.svelte'],
				parser: ts.parser,
				svelteConfig
			}
		}
	},
	{
		ignores: ['.svelte-kit/', 'build/', 'dist/', 'node_modules/', '__previewjs__/', '**/*.cjs']
	}
);
