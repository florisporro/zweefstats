<script lang="ts">
	import { getStatistics } from '../stats';
	import { permissions } from '../permissions';

	import SingleValueCard from './display/singlevaluecard.svelte';
	import TimeDisplay from './display/timedisplay.svelte';
	import KeyValue from './display/keyvalue.svelte';
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

	$: statistics = getStatistics(data);
	$: console.log(statistics);

	function handleKeydown(event: any) {
		if (event.key === 'Escape') {
			flightInspectorOpen = false;
		}
	}
</script>

<svelte:window on:keydown={handleKeydown} />

<Popup
	bind:open={flightInspectorOpen}
	on:close={() => {
		flightInspectorOpen = false;
	}}
>
	<Flights flights={inspectFlights} />
</Popup>

<section class="mb-12">
	{#if !statistics.pilot}
		<div class="alert alert-error shadow-lg">
			<div>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="stroke-current flex-shrink-0 h-6 w-6"
					fill="none"
					viewBox="0 0 24 24"
					><path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
					/></svg
				>
				<span
					>Sorry! Deze CSV is niet leesbaar. Om onbekende reden exporteert de Zweef App bij sommige
					mensen een niet-leesbaar CSV bestand. Het lijkt erop dat dit alleen bij instructeurs het
					geval is. Er is op dit moment nog geen oplossing beschikbaar.</span
				>
			</div>
		</div>
	{:else}
		<h2>Hallo, {statistics.pilot}</h2>

		<div class="alert shadow-lg w-2/3 mx-auto">
			<div>
				<span class="text-4xl p-6">ℹ️</span>

				<span
					>Dit tooltje geeft een analyse van de vliegdata op je Zweef App account. Daarmee kun je
					snel en makkelijk antwoord krijgen op vragen als "hoeveel PIC starts heb ik op type X",
					"hoeveel overland vluchten heb ik" en "in welk jaar heb ik het meest gevlogen". Maar zoals
					met iedere data analyse is de analyse slechts zo goed als de data die erin gaat. Dus als
					je twijfelt over de uitkomst, ga zelf je data na om fouten te vinden. Alle klikbare
					statistieken geven een overzicht van de vluchten die gebruikt zijn voor de berekening.</span
				>
			</div>
		</div>
	{/if}
</section>

<div class="divider">Totalen</div>

<section class="statscontainer segment">
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
</section>

<div class="divider">Gemiddelden</div>

<section class="statscontainer segment">
	<div class="stats shadow">
		<SingleValueCard name="Starts per dag"
			>{Math.round(statistics.averageFlightsPerDay * 100) / 100}</SingleValueCard
		>
		<SingleValueCard name="PIC starts per dag"
			>{Math.round(statistics.averagePicFlightsPerDay * 100) / 100}</SingleValueCard
		>
		<SingleValueCard name="DBO starts per dag"
			>{Math.round(statistics.averageDboFlightsPerDay * 100) / 100}</SingleValueCard
		>
	</div>
	<div class="stats shadow">
		<SingleValueCard name="Vliegtijd per dag (min)"
			>{Math.round(statistics.averageMinutesPerDay * 100) / 100}</SingleValueCard
		>
		<SingleValueCard name="Vliegtijd per jaar"
			><TimeDisplay value={Math.round(statistics.averageMinutesYear)} /></SingleValueCard
		>
	</div>
</section>

<div class="divider">Overland vluchten</div>

<section class="statscontainer segment">
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
	</div>
	<div class="alert shadow-lg w-2/3 mx-auto">
		<div>
			<span class="text-4xl p-6">ℹ️</span>

			<span
				>Een buitenlanding is hier: een vlucht waar de plek van aankomst verschilt van de plek van
				vertrek.
			</span>
		</div>
	</div>
	<div class="stats shadow">
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
</section>

<div class="divider">Jaren</div>

<section class="segment">
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
</section>

<div class="divider">Startmiddelen</div>

<section class="segment">
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
</section>
<div class="divider">Vliegtuigtypes</div>
<section class="segment">
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
</section>
<div class="divider">Vliegvelden</div>
<section class="segment">
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
</section>

<div class="divider">Sinds laatste examenvlucht</div>

<section class="statscontainer segment">
	{#if statistics.examFlights.length > 0}
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
	{:else}
		<p>Geen examenvluchten geregistreerd.</p>
	{/if}
</section>

<div class="divider">Bevoegdhedenmatrix</div>

<section class="segment">
	<div class="alert shadow-lg w-2/3 mx-auto mb-12">
		<div>
			<span class="text-4xl p-6">ℹ️</span>

			<span
				>Onderstaande gegevens dienen als hulpmiddel, de kans op fouten is aanwezig. Raadpleeg zelf
				de bevoegdheid matrix, en reken na bij twijfel:
				<a href="https://acvz.zweef.app/documenten" target="_blank" rel="noreferrer"
					>Club / EASA bevoegdheid Matrix</a
				></span
			>
		</div>
	</div>

	<div class="w-96 mx-auto mb-12">
		<div class="form-control mb-12">
			<label class="label cursor-pointer">
				<span class="label-text text-white"
					>Verberg vereisten die niet vastgesteld kunnen worden met data uit de Zweef app</span
				>
				<input type="checkbox" bind:checked={hideUnCheckedData} class="toggle toggle-lg" />
			</label>
		</div>
		<p class="text-white" />
	</div>
	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
		{#each permissions as permission}
			<div class="card bg-base-100 shadow-xl">
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
										🛑 {requirement.name}
										{requirement.goal ? `(${Math.round(value)} / ${requirement.goal})` : ``}
									</p>
									<progress class="progress w-56" value={goalFactor} max="1" />
								{/if}
							{:else if !hideUnCheckedData}
								<p>❓ {requirement.name}</p>
							{/if}
						{/each}
					</div>
				</div>
			</div>
		{/each}
	</div>
</section>

<style lang="postcss">
	.statscontainer {
		@apply flex flex-col w-full sm:w-3/4 lg:w-2/3 xl:w-1/2 gap-5 mx-auto;
	}
	.segment {
		@apply mb-12;
	}
</style>
