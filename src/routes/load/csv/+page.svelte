<script lang="ts">
	import FileSelect from '$lib/components/fileselect.svelte';
	import { sanitizeData } from '$lib/stats';
	import Papa from 'papaparse';
	import { error } from '@sveltejs/kit';
	import { goto } from '$app/navigation';

	let contents: string;
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
				sessionStorage.setItem('history', JSON.stringify(data));
				goto('/statsdisplay');
			}
		} catch (errorMessage) {
			throw error(500, 'Niet mogelijk om de CSV in te laden');
		}
	}
</script>

<div class="alert alert-error shadow-lg mb-12">
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
		<span
			>Er gaat op dit moment iets fout bij het exporteren van CSV files uit de Zweef app. De
			statistieken zullen onvolledig zijn, het is nu beter om de directe import functie te
			gebruiken.</span
		>
	</div>
</div>

<p class="text-center">
	Volg de volgende stappen om je CSV bestand te downloaden uit de Zweef app:
</p>

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

<div class="mx-auto text-center">
	<FileSelect bind:contents />
</div>
