<script lang="ts">
	import type { Flight } from '../interface';

	import { getStatistics } from '../stats';
	import type { Stats } from '../stats';

	import SingleValueCard from './display/singlevaluecard.svelte';
	import TimeDisplay from './display/timedisplay.svelte';
	import KeyValue from './display/keyvalue.svelte';
	import Fileselect from './fileselect.svelte';

	export let data: Flight[];

	export let statistics: Stats;

	$: statistics = getStatistics(data);
	$: console.log(statistics);
</script>

<div class="mt-6">
	<div>
		<h2>Hallo, {statistics.pilot}</h2>
		<h3>Dit zijn jouw totalen:</h3>
	</div>
	<div class="segment-large">
		<SingleValueCard name="Totaal starts">{data.length}</SingleValueCard>
		<SingleValueCard name="Totaal tijd"><TimeDisplay value={statistics.picTime} /></SingleValueCard>
	</div>
	<div class="segment-large mb-12">
		<SingleValueCard name="Totaal DBO starts">{statistics.dboFlights.length}</SingleValueCard>
		<SingleValueCard name="DBO tijd"><TimeDisplay value={statistics.dboTime} /></SingleValueCard>
	</div>
	<div class="segment-large mb-12">
		<SingleValueCard name="Totaal PIC starts">{statistics.picFlights.length}</SingleValueCard>
		<SingleValueCard name="PIC tijd"><TimeDisplay value={statistics.picTime} /></SingleValueCard>
	</div>
	<div class="segment-small">
		<SingleValueCard name="Examen vluchten">{statistics.examFlights.length}</SingleValueCard>
		<SingleValueCard name="Examen gehaald">{statistics.hasLicense ? '✅' : '❌'}</SingleValueCard>
		<SingleValueCard name="Totaal starts als PAX">{statistics.paxFlights.length}</SingleValueCard>
		<SingleValueCard name="PAX tijd"><TimeDisplay value={statistics.paxTime} /></SingleValueCard>
		<SingleValueCard name="Overlandjes">{statistics.xcountryFlights.length}</SingleValueCard>
		<SingleValueCard name="Overland pogingen"
			>{statistics.xcountryattemptFlights.length +
				statistics.xcountryFlights.length}</SingleValueCard
		>
		<SingleValueCard name="Laatste overland">{statistics.xcountryFlights[0].datum}</SingleValueCard>
		<SingleValueCard name="Buitenlandingen">{statistics.outlandings.length}</SingleValueCard>
	</div>
	<div class="segment-fullwidth">
		<h3>Dit zijn je starts per jaar:</h3>
		<KeyValue
			data={statistics.flightsByYear}
			display={[
				{ key: 'flightsCount', name: 'Vluchten' },
				{ key: 'totalTimeFormatted', name: 'Tijd' },
				{ key: 'dboFlightsCount', name: 'DBO Vluchten' },
				{ key: 'picFlightsCount', name: 'PIC Vluchten' },
				{ key: 'paxFlightsCount', name: 'PAX Vluchten' }
			]}
		/>
	</div>
	<div class="segment-fullwidth">
		<h3>Dit zijn je starts per startmiddel:</h3>
	</div>
	<div class="segment-fullwidth">
		<h3>Dit zijn je starts per vliegtuigtype:</h3>
		<KeyValue
			data={statistics.flightsByAirplane}
			display={[
				{ key: 'flightsCount', name: 'Vluchten' },
				{ key: 'totalTimeFormatted', name: 'Tijd' },
				{ key: 'dboFlightsCount', name: 'DBO Vluchten' },
				{ key: 'picFlightsCount', name: 'PIC Vluchten' },
				{ key: 'paxFlightsCount', name: 'PAX Vluchten' }
			]}
		/>
	</div>
	<h3>Dit zijn je starts per vliegveld:</h3>
	<h3>Dit zijn je statistieken sinds je laatste examen:</h3>
	<p>Let op: het systeem weet niet of je geslaagd bent...</p>
	<h3>Dit zijn je bevoegdheden:</h3>
	<h3>Dit zijn je achievements:</h3>
	<ul>
		<li>3-uurs vlucht</li>
		<li>5-uurs vlucht</li>
		<li>6-uurs en 57 minuten vlucht</li>
		<li>7-uurs vlucht</li>
		<li>Houten Reet - 3-uur of langer in oud hout</li>
		<li>Plastic Reet - 5-uur of langer in 21 of 23</li>
		<li>Kunststof Reet - 8-uur of langer in een prestatiekist</li>
		<li>St-akker - Buitenlanding binnen 60 minuten</li>
		<li>Overland met een Beeke</li>
		<li>Enkeltje Bel - Buitenlanding op Terlet</li>
		<li>Drentse gastvrijheid - Buitenlanding op Salland</li>
		<li>Net geen Duitsland - Buitenlanding op Venlo</li>
		<li>Buitenlanding op Flevo</li>
		<li>Rondje Rondweg - Gevlogen op Jena</li>
		<li>Gevlogen op Stendal</li>
		<li>Ervaren kampganger - Voor 2022 gevlogen op Stendal</li>
	</ul>
</div>

<style lang="postcss">
	h2 {
		@apply text-white text-6xl text-center;
	}
	h3 {
		@apply text-white text-3xl text-center;
	}

	.segment-fullwidth {
		@apply mb-12;
	}

	.segment-small {
		@apply grid grid-cols-4 gap-6 mb-12;
	}
	.segment-large {
		@apply grid grid-cols-2 gap-6 mb-12;
	}
</style>
