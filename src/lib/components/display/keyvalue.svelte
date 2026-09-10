<script lang="ts">
	interface KeyValueData {
		[key: string | number]: {
			[key: string | number]: any;
		};
	}

	interface Props {
		data?: KeyValueData;
		display?: { key: string; name: string }[];
		itemName?: string;
		inspectFlights: Flight[];
	}

	let {
		data = {},
		display = [],
		itemName = 'Item',
		inspectFlights = $bindable()
	}: Props = $props();

	function handleInspect(flights: Flight[]) {
		inspectFlights = flights;
	}
</script>

<div class="overflow-x-auto">
	<table class="table table-zebra table-auto w-full">
		<thead class="font-bold text-left">
			<tr>
				<th>{itemName}</th>
				{#each display as key (key.key)}
					<th>{key.name}</th>
				{/each}
			</tr>
		</thead>
		<tbody>
			{#each Object.entries(data) as [key, value] (key)}
				<tr>
					<td>
						<button
							type="button"
							class="linkbutton"
							onclick={(e) => {
								e.preventDefault();
								handleInspect(value.flights);
							}}
						>
							{key}
						</button>
					</td>
					{#each display as key (key.key)}
						<td>{value[key.key]}</td>
					{/each}
				</tr>
			{/each}
		</tbody>
	</table>
</div>
