<script lang="ts">
	interface KeyValueData {
		[key: string | number]: {
			[key: string | number]: any;
		};
	}

	export let data: KeyValueData = {};
	export let display: { key: string; name: string }[] = [];
	export let itemName: string = 'Item';
	export let inspectFlights: Flight[];

	function handleInspect(flights: Flight[]) {
		inspectFlights = flights;
	}

	let cols = 'grid-cols-4';

	$: cols = `grid-cols-${display.length + 1}`;
</script>

<div class="overflow-x-auto">
	<table class="table table-zebra table-auto w-full">
		<thead class="font-bold text-left">
			<tr>
				<th>{itemName}</th>
				{#each display as key}
					<th>{key.name}</th>
				{/each}
			</tr>
		</thead>
		<tbody>
			{#each Object.entries(data) as [key, value]}
				<tr>
					<td>
						<a
							href=""
							on:click|preventDefault={() => {
								handleInspect(value.flights);
							}}
						>
							{key}
						</a>
					</td>
					{#each display as key}
						<td>{value[key.key]}</td>
					{/each}
				</tr>
			{/each}
		</tbody>
	</table>
</div>
