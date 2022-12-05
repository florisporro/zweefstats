<script lang="ts">
	import FileSelect from '../lib/components/fileselect.svelte';
	import StatsDisplay from '../lib/components/statsdisplay.svelte';
	import { sanitizeData } from '$lib/stats';

	import Papa from 'papaparse';

	let contents: string;
	let error: string;
	let parsedCsv: object | null;
	let data: Flight[] | null;

	$: if (contents) {
		try {
			console.log('Parsing CSV');
			parsedCsv = Papa.parse(contents, {
				header: true,
				dynamicTyping: true,
				skipEmptyLines: true
			});

			if (parsedCsv !== null && parsedCsv.data) {
				data = sanitizeData(parsedCsv.data);
			}
		} catch (error) {
			error = error;
		}
	}
	$: console.log(data);
	$: console.log(error);
</script>

<section class="container mx-auto py-12">
	<h1>Zweefstats</h1>
	<div class="text-sm text-center mb-12">
		<span
			><a href="https://github.com/florisporro/zweefstats" target="_blank" rel="noreferrer"
				>Broncode op GitHub</a
			></span
		>
		-
		<span
			><a href="https://github.com/florisporro/zweefstats/issues" target="_blank" rel="noreferrer"
				>Fout rapporteren</a
			></span
		>
	</div>
	{#if data}
		<div class="text-sm text-center mb-12">
			<button
				class="btn btn-wide"
				on:click={() => {
					data = null;
					parsedCsv = null;
					contents = '';
				}}>Terug naar begin</button
			>
		</div>
		<StatsDisplay {data} />
	{:else}
		<ul>
			<li>✅ Check je bevoegdheden progressie volgens ACvZ reglementen</li>
			<li>✅ Krijg interessante statistieken over je vlieghistorie</li>
			<li>✅ Volledig lokaal - data wordt niet verzonden</li>
			<li>✅ Klik op datapunten om te zien welke vluchten er gebruikt zijn</li>
			<li>❌ Werkt niet goed op telefoons</li>
			<li>❌ Werkt om onbekende reden niet voor instructeurs (sorry instructeurs)</li>
		</ul>

		<div class="flex flex-row flex-1 my-8 justify-center">
			<div class="rounded-xl max-w-sm overflow-hidden shadow-lg mr-4">
				<img src="/step1.png" alt="Step 1" />
			</div>
			<div class="rounded-xl max-w-sm overflow-hidden shadow-lg mr-4">
				<img src="/step2.png" alt="Step 2" />
			</div>
			<div class="rounded-xl max-w-sm overflow-hidden shadow-lg">
				<img src="/step3.png" alt="Step 3" />
			</div>
		</div>
		<FileSelect bind:contents />
	{/if}
</section>

<style lang="postcss">
	h1 {
		@apply text-8xl uppercase text-center;

		-webkit-text-fill-color: transparent;
		-webkit-text-stroke-color: white;
		-webkit-text-stroke-width: 4px;
	}

	ul {
		@apply text-center text-white text-lg leading-8 lg:text-xl lg:leading-9 xl:text-2xl xl:leading-10;
	}
</style>
