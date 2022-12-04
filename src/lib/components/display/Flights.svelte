<script lang="ts">
	export let flights: Flight[] = [];
</script>

<div class="overflow-x-auto">
	<table class="table table-zebra table-compact w-full">
		<thead class="font-bold text-left">
			<tr>
				<td>Datum</td>
				<td>Starttijd</td>
				<td>Landingstijd</td>
				<td>Vluchtduur</td>
				<td>Van</td>
				<td>Naar</td>
				<td>Vliegtuig</td>
				<td>PIC</td>
				<td>Tweede inzittende</td>
				<td>Startmethode</td>
				<td>FIS</td>
				<td>Training</td>
				<td>Examen</td>
				<td>Overland</td>
			</tr>
		</thead>
		<tbody>
			{#each flights as flight}
				<tr>
					<td><pre>{flight.datum}</pre></td>
					<td><pre>{flight.start_tijd}</pre></td>
					<td><pre>{flight.landings_tijd}</pre></td>
					<td><pre>{flight.vluchtduur}</pre></td>
					<td><pre>{flight.vertrek_vliegveld}</pre></td>
					<td><pre>{flight.aankomst_vliegveld}</pre></td>
					<td><pre>{flight.callsign} - {flight.registratie} - {flight.type}</pre></td>
					<td><pre>{flight.gezagvoerder_naam}</pre></td>
					<td><pre>{flight.tweede_inzittende_naam}</pre></td>
					<td><pre>{flight.start_methode}</pre></td>
					<td><pre>{flight.is_fis ? '✅' : ''}</pre></td>
					<td><pre>{flight.is_training ? '✅' : ''}</pre></td>
					<td><pre>{flight.is_examen ? '✅' : ''}</pre></td>
					<td><pre>{flight.is_overland ? '✅' : ''}</pre></td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>
