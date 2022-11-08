<script lang="ts">
	interface KeyValueData {
		[key: string | number]: {
			[key: string | number]: string | number;
		};
	}

	export let data: KeyValueData = {};
	export let display: { key: string; name: string }[] = [];

	let cols = 'grid-cols-4';

	$: cols = `grid-cols-${display.length + 1}`;
</script>

<div class="bg-white rounded-2xl shadow-lg px-8 py-4 grid {cols} gap-2">
	<!-- Header -->
	<div class="font-bold">Item</div>
	{#each display as key}
		<div class="font-bold">{key.name}</div>
	{/each}
	{#each Object.entries(data) as [key, value]}
		<pre>{key}</pre>
		{#each display as key}
			<pre>{value[key.key]}</pre>
		{/each}
	{/each}
</div>
