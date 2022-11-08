<script lang="ts">
	import FileSelect from '../lib/components/fileselect.svelte';
	import StatsDisplay from '../lib/components/statsdisplay.svelte';
	import { sanitizeData } from '$lib/stats';

	import { data } from '../lib/datastub';

	import Papa from 'papaparse';

	import type { Flight } from '../lib/interface';

	let contents: string;
	let error: string;
	let parsedCsv: object | null;
	// let data: Stats[] | null;

	// $: if (contents) {
	// 	try {
	// 		console.log('Parsing CSV');
	// 		parsedCsv = Papa.parse(contents, {
	// 			header: true,
	// 			dynamicTyping: true,
	// 			skipEmptyLines: true
	// 		});
	// 		data = sanitizeData(parsedCsv);
	// 	} catch (error) {
	// 		error = error;
	// 	}
	// }
	// $: console.log(data);
	// $: console.log(error);
</script>

<section class="container mx-auto mt-12">
	<h1>ACVZ Checkotron 3000</h1>
	{#if data}
		<!-- <button
			on:click={() => {
				data = null;
				parsedCsv = null;
				contents = '';
			}}>Reset</button
		> -->
		<StatsDisplay {data} />
	{:else}
		<ul>
			<li>✅ Check je bevoegdheden progressie volgens ACvZ reglementen</li>
			<li>✅ Krijg interessante statistieken over je vlieghistorie</li>
			<li>✅ Volledig lokaal - je data wordt niet verzonden</li>
			<li>❌ Werkt niet voor vereisten als checkstarts, brevetten etc</li>
			<li>
				❌ Werkt (nog) niet goed voor vliegers die meerdere starts in één regel opslaan, zoals
				instructeurs (sorry instructeurs)
			</li>
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
		@apply text-2xl text-center text-white leading-10;
	}
</style>
