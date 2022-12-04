<script lang="ts">
	import { getStatistics } from '../stats';
	import { permissions } from '../permissions';

	import SingleValueCard from './display/singlevaluecard.svelte';
	import TimeDisplay from './display/timedisplay.svelte';
	import KeyValue from './display/keyvalue.svelte';
	import Fileselect from './fileselect.svelte';
	import Flights from './display/Flights.svelte';
	import Popup from './popup.svelte';

	export let data: Flight[];
	let statistics: Stats;

	let inspectFlights: Flight[] = [];
	$: {
		inspectFlights;
		if (inspectFlights.length > 0) {
			flightInspectorOpen = true;
		}
	}

	let flightInspectorOpen = false;

	let hideUnCheckedData = true;

	$: if (inspectFlights.length > 0) {
		// flightInspectorOpen = true;
		console.log({
			flightInspectorOpen
		});
	}
	$: statistics = getStatistics(data);
	$: console.log(statistics);

	function handleKeydown(event: any) {
		if (event.key === 'Escape') {
			flightInspectorOpen = false;
		}
	}
</script>

<svelte:window on:keydown={handleKeydown} />

<div>
	<h2>Hallo, {statistics.pilot}</h2>

	<Popup
		bind:open={flightInspectorOpen}
		on:close={() => {
			flightInspectorOpen = false;
		}}
	>
		<Flights flights={inspectFlights} />
	</Popup>

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
		<SingleValueCard name="Examen vluchten">
			<a
				href={'#'}
				on:click|preventDefault={() => {
					inspectFlights = statistics.examFlights;
				}}>{statistics.examFlights.length}</a
			>
		</SingleValueCard>
		<SingleValueCard name="Examen gehaald">{statistics.hasLicense ? '✅' : '❌'}</SingleValueCard>
	</div>
	<div class="stats shadow">
		<SingleValueCard name="Totaal starts als PAX">
			<a
				href={'#'}
				on:click|preventDefault={() => {
					inspectFlights = statistics.paxFlights;
				}}>{statistics.paxFlights.length}</a
			>
		</SingleValueCard>
		<SingleValueCard name="PAX tijd"><TimeDisplay value={statistics.paxTime} /></SingleValueCard>
	</div>
	<div class="stats shadow">
		<SingleValueCard name="Overland vluchten">
			<a
				href={'#'}
				on:click|preventDefault={() => {
					inspectFlights = statistics.xcountryFlights;
				}}>{statistics.xcountryFlights.length}</a
			>
		</SingleValueCard>
		<SingleValueCard name="Overland pogingen">
			<a
				href={'#'}
				on:click|preventDefault={() => {
					inspectFlights = statistics.xcountryattemptFlights;
				}}>{statistics.xcountryattemptFlights.length}</a
			>
		</SingleValueCard>
		{#if statistics.xcountryFlights.length > 0}
			<SingleValueCard name="Laatste overland"
				>{statistics.xcountryFlights[0].datum}</SingleValueCard
			>
			<SingleValueCard name="Buitenlandingen">
				<a
					href={'#'}
					on:click|preventDefault={() => {
						inspectFlights = statistics.outlandings;
					}}>{statistics.outlandings.length}</a
				>
			</SingleValueCard>
		{/if}
	</div>
</div>
<div class="segment">
	<h3>Dit zijn je starts per jaar:</h3>
	<KeyValue
		data={statistics.flightsByYear}
		bind:inspectFlights
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
		bind:inspectFlights
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
		bind:inspectFlights
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
		bind:inspectFlights
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
			<a href="https://acvz.zweef.app/documenten" target="_blank" rel="noreferrer"
				>Club / EASA bevoegdheid Matrix</a
			>
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
