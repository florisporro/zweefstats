<script>
	import '../app.pcss';
</script>

<section class="container mx-auto py-12">
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
	<div class="sm:hidden alert alert-error shadow-lg mb-12">
		<div>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="stroke-current flex-shrink-0 h-6 w-6"
				fill="none"
				viewBox="0 0 24 24"
				><path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
				/></svg
			>
			<span>Hoi! Sorry, dit tooltje werkt bijzonder slecht op telefoons.</span>
		</div>
	</div>
	<slot />
</section>

<style lang="postcss">
	h1 {
		@apply text-8xl uppercase text-center;

		-webkit-text-fill-color: transparent;
		-webkit-text-stroke-color: white;
		-webkit-text-stroke-width: 4px;
	}

	h1 a {
		@apply text-white hover:text-white hover:no-underline no-underline;
	}
</style>
