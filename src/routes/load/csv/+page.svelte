<script lang="ts">
	import FileSelect from '$lib/components/fileselect.svelte';
	import { sanitizeData } from '$lib/sanitize';
	import Papa from 'papaparse';
	import { error } from '@sveltejs/kit';
	import { goto } from '$app/navigation';

	let contents: string;
	let data: DutchFlight[] | null;

	$: if (contents) {
		try {
			console.log('Parsing CSV');
			const parsedCsv = Papa.parse(contents, {
				header: true,
				dynamicTyping: true,
				skipEmptyLines: true
			});

			if (parsedCsv && parsedCsv.data && parsedCsv.data.length > 0) {
				console.log('CSV parsed successfully');
				
				// Log field names from the first row for debugging
				const firstRow = parsedCsv.data[0];
				console.log('CSV field names:', Object.keys(firstRow));
				
				// First pass: collect all passenger IDs and their names
				const passengerIdToName = new Map();
				const pilotIdToName = new Map();
				
				// Gather passenger and pilot name mappings from all rows
				parsedCsv.data.forEach((row: any) => {
					// Handle English or Dutch field names
					if ((row.passenger_id || row.tweede_inzittende_id) && (row.passenger_name || row.tweede_inzittende_naam)) {
						const id = row.passenger_id || row.tweede_inzittende_id;
						const name = row.passenger_name || row.tweede_inzittende_naam;
						passengerIdToName.set(id, name);
					}
					
					if ((row.pic_id || row.gezagvoerder_id) && (row.pic_name || row.gezagvoerder_naam)) {
						const id = row.pic_id || row.gezagvoerder_id;
						const name = row.pic_name || row.gezagvoerder_naam;
						pilotIdToName.set(id, name);
					}
				});
				
				console.log(`Found ${passengerIdToName.size} passenger ID-name mappings`);
				console.log(`Found ${pilotIdToName.size} pilot ID-name mappings`);

				// Second pass: fill in missing names based on IDs
				const processedData = parsedCsv.data.map((row: any, index: number) => {
					// Create a copy to avoid modifying the original
					const processedRow = { ...row };
					
					// Handle missing passenger names - check both English and Dutch fields
					const passengerId = processedRow.passenger_id || processedRow.tweede_inzittende_id;
					if (passengerId && !(processedRow.passenger_name || processedRow.tweede_inzittende_naam)) {
						let passengerName = null;
						
						// Try to find the name in our mappings
						if (passengerIdToName.has(passengerId)) {
							passengerName = passengerIdToName.get(passengerId);
						} else if (pilotIdToName.has(passengerId)) {
							passengerName = pilotIdToName.get(passengerId);
						} else {
							passengerName = `Passenger #${passengerId}`;
						}
						
						// Set the name in the appropriate field
						if ('passenger_name' in processedRow) {
							processedRow.passenger_name = passengerName;
						} else {
							processedRow.tweede_inzittende_naam = passengerName;
						}
						
						if (index < 5) {
							console.log(`Assigned passenger name for ID ${passengerId}: ${passengerName}`);
						}
					}
					
					// Debug output for first few rows
					if (index < 3) {
						console.log(`Row ${index} after processing:`, processedRow);
					}
					
					return processedRow;
				});
                
				// Use our sanitizeData function, which will handle all property conversions
				data = sanitizeData(processedData);
				
				if (data.length > 0) {
					console.log('First row after sanitization:', data[0]);
				}
				
				// Store the data and navigate to the stats display page
				sessionStorage.setItem('history', JSON.stringify(data));
				goto('/statsdisplay');
			} else {
				throw error(400, 'CSV bevat geen geldige gegevens');
			}
		} catch (errorMessage) {
			console.error('Error loading CSV:', errorMessage);
			throw error(500, 'Niet mogelijk om de CSV in te laden');
		}
	}
</script>

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