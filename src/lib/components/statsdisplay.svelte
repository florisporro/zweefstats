<script lang="ts">
	import { getStatistics } from '../stats';
	import { permissions } from '../permissions';
	import type { Stats } from '../stats';

	import SingleValueCard from './display/singlevaluecard.svelte';
	import TimeDisplay from './display/timedisplay.svelte';
	import KeyValue from './display/keyvalue.svelte';
	import Fileselect from './fileselect.svelte';

	export let data: Flight[];

	export let statistics: Stats = [];

	let hideUnCheckedData = true;

	$: statistics = getStatistics(data);
	$: console.log(statistics);
</script>

<div>
	<h2>Hallo, {statistics.pilot}</h2>

	<h3>Dit zijn jouw totalen:</h3>
</div>
<div class="flex flex-row flex-wrap gap-5 segment">
	<div class="stats shadow">
		<SingleValueCard name="Totaal starts">{data.length}</SingleValueCard>
		<SingleValueCard name="Totaal tijd"
			><TimeDisplay value={statistics.totalTime} /></SingleValueCard
		>
	</div>
	<div class="stats shadow">
		<SingleValueCard name="Totaal DBO starts">{statistics.dboFlights.length}</SingleValueCard>
		<SingleValueCard name="DBO tijd"><TimeDisplay value={statistics.dboTime} /></SingleValueCard>
	</div>
	<div class="stats shadow">
		<SingleValueCard name="Totaal PIC starts">{statistics.picFlights.length}</SingleValueCard>
		<SingleValueCard name="PIC tijd"><TimeDisplay value={statistics.picTime} /></SingleValueCard>
	</div>
	<div class="stats shadow">
		<SingleValueCard name="Examen vluchten">{statistics.examFlights.length}</SingleValueCard>
		<SingleValueCard name="Examen gehaald">{statistics.hasLicense ? '✅' : '❌'}</SingleValueCard>
	</div>
	<div class="stats shadow">
		<SingleValueCard name="Totaal starts als PAX">{statistics.paxFlights.length}</SingleValueCard>
		<SingleValueCard name="PAX tijd"><TimeDisplay value={statistics.paxTime} /></SingleValueCard>
	</div>
	<div class="stats shadow">
		<SingleValueCard name="Overland vluchten">{statistics.xcountryFlights.length}</SingleValueCard>
		<SingleValueCard name="Overland pogingen"
			>{statistics.xcountryattemptFlights.length}</SingleValueCard
		>
		{#if statistics.xcountryFlights.length > 0}
			<SingleValueCard name="Laatste overland"
				>{statistics.xcountryFlights[0].datum}</SingleValueCard
			>
			<SingleValueCard name="Buitenlandingen">{statistics.outlandings.length}</SingleValueCard>
		{/if}
	</div>
</div>
<div class="segment">
	<h3>Dit zijn je starts per jaar:</h3>
	<KeyValue
		data={statistics.flightsByYear}
		itemName="Jaar"
		display={[
			{ key: 'flightsCount', name: 'Vluchten' },
			{ key: 'totalTimeFormatted', name: 'Tijd' },
			{ key: 'dboFlightsCount', name: 'DBO Vluchten' },
			{ key: 'picFlightsCount', name: 'PIC Vluchten' },
			{ key: 'paxFlightsCount', name: 'PAX Vluchten' },
			{ key: 'xcountryFlightsCount', name: 'Overland vluchten' },
			{ key: 'xcountryattemptFlightsCount', name: 'Overland pogingen' }
		]}
	/>
</div>
<div class="segment">
	<h3>Dit zijn je starts per startmiddel:</h3>
	<KeyValue
		data={statistics.flightsByLaunchMethod}
		itemName="Startmiddel"
		display={[
			{ key: 'flightsCount', name: 'Vluchten' },
			{ key: 'totalTimeFormatted', name: 'Tijd' },
			{ key: 'dboFlightsCount', name: 'DBO Vluchten' },
			{ key: 'picFlightsCount', name: 'PIC Vluchten' },
			{ key: 'paxFlightsCount', name: 'PAX Vluchten' }
		]}
	/>
</div>
<div class="segment">
	<h3>Dit zijn je starts per vliegtuigtype:</h3>
	<KeyValue
		data={statistics.flightsByAirplane}
		itemName="Type"
		display={[
			{ key: 'flightsCount', name: 'Vluchten' },
			{ key: 'totalTimeFormatted', name: 'Tijd' },
			{ key: 'dboFlightsCount', name: 'DBO Vluchten' },
			{ key: 'picFlightsCount', name: 'PIC Vluchten' },
			{ key: 'paxFlightsCount', name: 'PAX Vluchten' },
			{ key: 'xcountryFlightsCount', name: 'Overland vluchten' },
			{ key: 'xcountryattemptFlightsCount', name: 'Overland pogingen' }
		]}
	/>
</div>
<div class="segment">
	<h3>Dit zijn je starts per vliegveld:</h3>
	<KeyValue
		data={statistics.flightsByAirfield}
		itemName="Vliegveld"
		display={[
			{ key: 'flightsCount', name: 'Vluchten' },
			{ key: 'totalTimeFormatted', name: 'Tijd' },
			{ key: 'dboFlightsCount', name: 'DBO Vluchten' },
			{ key: 'picFlightsCount', name: 'PIC Vluchten' },
			{ key: 'paxFlightsCount', name: 'PAX Vluchten' }
		]}
	/>
</div>
<h3>Dit zijn je starts sinds je laatste examen:</h3>
<div class="flex flex-row flex-wrap gap-5 segment">
	<div class="stats shadow">
		<SingleValueCard name="Totaal starts">{statistics.flightsAfterExam.length}</SingleValueCard>
		<SingleValueCard name="Totaal tijd"
			><TimeDisplay value={statistics.timesAfterExam.totalTime} /></SingleValueCard
		>
	</div>
	<div class="stats shadow">
		<SingleValueCard name="Totaal DBO starts"
			>{statistics.timesAfterExam.dboFlights.length}</SingleValueCard
		>
		<SingleValueCard name="DBO tijd"
			><TimeDisplay value={statistics.timesAfterExam.dboTime} /></SingleValueCard
		>
	</div>
	<div class="stats shadow">
		<SingleValueCard name="Totaal PIC starts"
			>{statistics.timesAfterExam.picFlights.length}</SingleValueCard
		>
		<SingleValueCard name="PIC tijd"
			><TimeDisplay value={statistics.timesAfterExam.picTime} /></SingleValueCard
		>
	</div>
</div>
<h3>Dit is je progressie in de bevoegdheden matrix:</h3>
<div class="segment">
	<div class="w-96 mx-auto mb-12">
		<div class="form-control mb-12">
			<label class="label cursor-pointer">
				<span class="label-text text-white"
					>Verberg vereisten die niet vastgesteld kunnen worden met data uit de Zweef app</span
				>
				<input type="checkbox" bind:checked={hideUnCheckedData} class="checkbox checkbox-lg" />
			</label>
		</div>
		<p class="text-white">
			Onderstaande gegevens dienen als hulpmiddel. Raadpleeg zelf de bevoegdheid matrix:
			<a href="https://acvz.zweef.app/documenten" target="_blank">Club / EASA bevoegdheid Matrix</a>
		</p>
	</div>
	<div class="flex flex-row flex-wrap gap-10">
		{#each permissions as permission}
			<div class="card w-96 bg-base-100 shadow-xl">
				<div class="card-body">
					<h2 class="card-title text-black">{permission.name}</h2>
					<div class="flex flex-col gap-2">
						{#each permission.requirements as requirement}
							{#if requirement.calculate}
								{@const value = requirement.calculate(statistics)}
								{@const goalFactor = requirement.goal ? value / requirement.goal : value}
								{#if goalFactor >= 1}
									<p>
										✅ {requirement.name}
										{requirement.goal ? `(${Math.round(value)} / ${requirement.goal})` : ``}
									</p>
								{:else}
									<p>
										🟠 {requirement.name}
										{requirement.goal ? `(${Math.round(value)} / ${requirement.goal})` : ``}
									</p>
									<progress class="progress w-56" value={goalFactor} max="1" />
								{/if}
								<!-- <p>{value} / {requirement.goal}</p>
							<p>{value}</p>
							<p>{requirement.name}</p> -->
							{:else if !hideUnCheckedData}
								<p>❓ {requirement.name}</p>
							{/if}
						{/each}
					</div>
				</div>
			</div>
		{/each}
	</div>
</div>

<div class="segment">
	<h3>Data explorer</h3>
	<p>
		Wil je weten of de filters kloppen / op basis van welke vluchten de berekening gedaan is? Door
		hier een filter te selecteren krijg je te zien welke vluchten gebruikt zijn voor deze data, op
		die manier kun je kijken of er fouten in de data zitten.
	</p>
	<select class="select select-info w-full max-w-xs">
		<option disabled selected>Selecteer filter</option>
		<option>Alle vluchten</option>
		<option>PIC vluchten</option>
		<option>DBO vluchten</option>
		<option>PAX vluchten</option>
		<option>Overland vluchten</option>
		<option>Overland pogingen</option>
		<option>Buitenlandingen</option>
		<option>Examen vluchten</option>
		<option>Vluchten na laatste examen</option>
	</select>
</div>

<!-- <h3>Dit zijn je achievements:</h3> -->

<!-- <ul>
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
	</ul> -->
<style lang="postcss">
	.segment {
		@apply mb-12;
	}
</style>
