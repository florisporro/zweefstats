<script lang="ts">
	import type { Stats } from '../interface';

	import { getStatistics } from '../stats';

	import SingleValueCard from './display/singlevaluecard.svelte';
	import TimeDisplay from './display/timedisplay.svelte';

	export let data: Stats[];

	export let statistics: object = {};

	$: statistics = getStatistics(data);
	$: console.log(statistics);
</script>

<div class="mt-6">
	<div class="mb-10">
		<h2>Hallo, {statistics.pilot}</h2>
		<h3>Dit zijn jouw totalen:</h3>
	</div>
	<div class="grid grid-cols-3 gap-6">
		<SingleValueCard name="Totaal starts">{data.length}</SingleValueCard>
		<SingleValueCard name="Totaal DBO starts">{statistics.dboFlights.length}</SingleValueCard>
		<SingleValueCard name="Totaal PIC starts">{statistics.picFlights.length}</SingleValueCard>
		<SingleValueCard name="Totaal starts als PAX">{statistics.paxFlights.length}</SingleValueCard>
		<SingleValueCard name="DBO tijd"><TimeDisplay value={statistics.dboTime} /></SingleValueCard>
		<SingleValueCard name="PIC tijd"><TimeDisplay value={statistics.picTime} /></SingleValueCard>
		<SingleValueCard name="PAX tijd"><TimeDisplay value={statistics.paxTime} /></SingleValueCard>
		<SingleValueCard name="Overlandjes">{statistics.xcountryFlights.length}</SingleValueCard>
		<SingleValueCard name="Overland pogingen (<33 min)"
			>{statistics.xcountryattemptFlights.length}</SingleValueCard
		>
		<SingleValueCard name="Laatste overland">{statistics.xcountryFlights[0].datum}</SingleValueCard>
		<SingleValueCard name="Buitenlandingen">{statistics.outlandings.length}</SingleValueCard>
	</div>
	<h3>Dit zijn je starts per vliegtuigtype:</h3>
	<h3>Dit zijn je starts per jaar:</h3>
	<h3>Dit zijn je starts per jaar:</h3>
	<h3>Dit zijn je bevoegdheden:</h3>
</div>

<style lang="postcss">
	h2 {
		@apply text-white text-6xl text-center;
	}
	h3 {
		@apply text-white text-3xl text-center;
	}
</style>
