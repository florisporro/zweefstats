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

<p class="text-white text-center">
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
