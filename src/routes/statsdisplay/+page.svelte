<script lang="ts">
	import StatsDisplay from '$lib/components/statsdisplay.svelte';
	import type { PageData } from './$types';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
</script>

<section class="container mx-auto py-12">
	{#if data.sanitizedData !== undefined}
		<StatsDisplay data={data.sanitizedData} />
	{:else}
		<h2>❌ Er is geen data ingeladen</h2>
	{/if}
</section>
