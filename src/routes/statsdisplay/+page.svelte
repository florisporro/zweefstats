<script lang="ts">
	import { page } from '$app/stores';
	import Statsdisplay from '$lib/components/statsdisplay.svelte';
	import StatsDisplay from '$lib/components/statsdisplay.svelte';
	import { sanitizeData } from '$lib/sanitize';
	import { error } from '@sveltejs/kit';
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<section class="container mx-auto py-12">
	{#if data.sanitizedData !== undefined}
		<StatsDisplay data={data.sanitizedData} />
	{:else}
		<h2>❌ Er is geen data ingeladen</h2>
	{/if}
</section>
