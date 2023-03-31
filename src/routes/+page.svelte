<script lang="ts">
	import type { PageData } from './$types';
	import SingleValueCard from '$lib/components/display/singlevaluecard.svelte';
	import TimeDisplay from '$lib/components/display/timedisplay.svelte';
	import KeyValue from '$lib/components/display/keyvalue.svelte';

	export let data: PageData;

	function round(value: number) {
		return Math.round(value * 100) / 100;
	}
</script>

<p class="text-white prose mx-auto mb-12">
	Dit tooltje geeft een analyse van de vliegdata op je Zweef App account. Daarmee kun je snel en
	makkelijk antwoord krijgen op vragen als "hoeveel PIC starts heb ik op type X", "hoeveel overland
	vluchten heb ik" en "in welk jaar heb ik het meest gevlogen". Je hebt de optie om je gegevens in
	te sturen om meegenomen te worden in de nationale statistieken hieronder. In de toekomst kunnen we
	daarmee interessante inzichten geven over de prestaties van Zweefvliegend Nederland.
</p>

<ul>
	<li>✅ Check je bevoegdheden progressie (op dit moment alleen ondersteund voor de ACvZ)</li>
	<li>✅ Krijg interessante statistieken over je vlieghistorie</li>
	<li>✅ Volledig lokaal - deel je data alleen als je dat wilt</li>
	<li>✅ Klik op datapunten om te zien welke vluchten er gebruikt zijn</li>
	<li>📵 Werkt niet goed op telefoons</li>
</ul>

<div class="buttons flex flex-row gap-5 justify-center mt-12 mb-2">
	<a href="/load/zweefapp" class="btn btn-lg">Data inladen uit de Zweef App</a>
</div>
<div class="buttons flex flex-row gap-5 justify-center mb-12">
	<a href="/load/csv" class="btn btn-outline">Data inladen uit CSV</a>
</div>

{#if data.stats}
	<h3>Nationale Statistieken</h3>
	<p class="text-white prose mx-auto">
		Na het inladen van je eigen statistieken krijg je de optie om je vluchtinformatie te delen.
		Daarmee kunnen we de onderstaande statistieken berekenen:
	</p>
	<p class="text-white prose mx-auto mb-12 text-sm">
		(de herberekening van de statistieken gebeurt eenmaal per uur, op het hele uur)
	</p>

	<section class="statscontainer segment">
		<div class="stats shadow">
			<SingleValueCard name="Piloten">{data.stats.pilots}</SingleValueCard>
			<SingleValueCard name="Starts">{data.stats.flightsCount}</SingleValueCard>
			<SingleValueCard name="PIC Starts">{data.stats.picFlightsCount}</SingleValueCard>
			<SingleValueCard name="DBO Starts">{data.stats.dboFlightsCount}</SingleValueCard>
			<SingleValueCard name="PAX Starts">{data.stats.paxFlightsCount}</SingleValueCard>
		</div>
		<div class="stats shadow">
			<SingleValueCard name="Totaal tijd"
				><TimeDisplay showMinutes={false} value={data.stats.totalTime} /></SingleValueCard
			>
			<SingleValueCard name="PIC tijd"
				><TimeDisplay showMinutes={false} value={data.stats.picTime} /></SingleValueCard
			>
			<SingleValueCard name="DBO tijd"
				><TimeDisplay showMinutes={false} value={data.stats.dboTime} /></SingleValueCard
			>
			<SingleValueCard name="PAX tijd"
				><TimeDisplay showMinutes={false} value={data.stats.paxTime} /></SingleValueCard
			>
		</div>
		<div class="stats shadow">
			<SingleValueCard name="Vluchten per dag"
				>{round(data.stats.averageFlightsPerDay)}</SingleValueCard
			>
			<SingleValueCard name="PIC vluchten per dag"
				>{round(data.stats.averagePicFlightsPerDay)}</SingleValueCard
			>
			<SingleValueCard name="DBO vluchten per dag"
				>{round(data.stats.averageDboFlightsPerDay)}</SingleValueCard
			>
			<SingleValueCard name="Minuten per dag"
				>{round(data.stats.averageMinutesPerDay)}</SingleValueCard
			>
		</div>
		<div class="stats shadow">
			<SingleValueCard name="Starts per jaar">{round(data.stats.averageStartsYear)}</SingleValueCard
			>
			<SingleValueCard name="PIC starts per jaar"
				>{round(data.stats.averagePicStartsYear)}</SingleValueCard
			>
			<SingleValueCard name="Tijd per jaar">
				<TimeDisplay value={data.stats.averageMinutesYear} />
			</SingleValueCard>
		</div>
	</section>
{/if}

<style lang="postcss">
	ul {
		@apply text-center text-white text-lg leading-8 lg:text-xl lg:leading-9 xl:text-2xl xl:leading-10;
	}

	.statscontainer {
		@apply flex flex-col w-full sm:w-3/4 lg:w-2/3 xl:w-1/2 gap-5 mx-auto;
	}
</style>
