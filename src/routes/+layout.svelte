<script lang="ts">
	import '../app.css';
	interface Props {
		children?: import('svelte').Snippet;
	}

	let { children }: Props = $props();
</script>

<section class="container mx-auto py-12 px-2">
	<h1><a href="/">Zweefstats</a></h1>
	<div class="text-sm text-center mb-12">
		<span
			><a href="https://github.com/florisporro/zweefstats" target="_blank" rel="noreferrer"
				>GitHub</a
			></span
		>
		-
		<span
			><a href="https://github.com/florisporro/zweefstats/issues" target="_blank" rel="noreferrer"
				>Issues</a
			></span
		>
		-
		<span><a href="/changelog">Changelog</a></span>
	</div>
	{@render children?.()}
</section>

<style lang="postcss">
	h1 {
		@apply text-4xl stroke-slate-400 md:text-8xl uppercase text-center;

		-webkit-text-fill-color: transparent;
		/* -webkit-text-stroke-color: white; */
		-webkit-text-stroke-width: 2px;
	}

	h1 a {
		@apply text-white hover:text-white hover:no-underline no-underline;
	}
</style>
