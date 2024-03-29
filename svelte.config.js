import adapter from '@sveltejs/adapter-auto';
import preprocess from 'svelte-preprocess';
import { markdown } from 'svelte-preprocess-markdown';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://github.com/sveltejs/svelte-preprocess
	// for more information about preprocessors
	extensions: [".svelte", ".md"],
	preprocess: [
		preprocess({
			postcss: true,
		}),
		markdown(),
	],
	kit: {
		adapter: adapter()
	}
};

export default config;
