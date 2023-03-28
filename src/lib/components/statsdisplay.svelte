<script lang="ts">
	import { getStatistics } from '../stats';
	import { saveStats } from '../saveload';
	import Clubs from '../permissions';

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
	let shareStatsClosed = false;
	let shareStatsSending = false;
	let shareStatsSent = false;

	let hideUnCheckedData = true;

	const sessionStorageValue = sessionStorage.getItem('zweefapp');
	const parsedsessionStorage = sessionStorageValue ? JSON.parse(sessionStorageValue) : null;
	let selectedClub = parsedsessionStorage ? parsedsessionStorage.club.toLowerCase() : '';

	$: console.log({ selectedClub });

	$: statistics = getStatistics(data);
	$: console.log(statistics);

	function handleKeydown(event: any) {
		if (event.key === 'Escape') {
			flightInspectorOpen = false;
		}
	}

	async function shareStats() {
		shareStatsSending = true;
		const response = await saveStats(statistics, selectedClub);
		console.log(response);
		shareStatsSending = false;
		shareStatsSent = true;
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
					>Sorry! Deze CSV is niet leesbaar. Om onbekende reden werkt de CSV export functie niet
					goed in sommige browsers. Probeer het opnieuw via een andere browser of apparaat. Als je
					het via een telefoon probeerde, kan dit mogelijk de oorzaak zijn. Probeer het dan via een
					PC.</span
				>
			</div>
		</div>
	{:else}
		<h2>Statistieken voor {statistics.pilot}</h2>

		{#if !shareStatsClosed}
			<div class="alert alert-warning shadow-lg mb-5 w-2/3 mx-auto">
				{#if shareStatsSending}
					<div>
						<span class="text-4xl p-6">📡</span>
						<span>Verzenden...</span>
					</div>
				{/if}
				{#if shareStatsSent}
					<div>
						<span class="text-4xl p-6">✅</span>
						<span
							>Dank voor het delen van je gegevens! Ze worden verwerkt en binnen een uur aan de
							statistieken op de homepage toegevoegd. Eerder ingestuurde gegevens worden automatisch
							vervangen.</span
						>
					</div>
				{/if}
				{#if !shareStatsSending && !shareStatsSent}
					<div>
						<span class="text-4xl p-6">📡</span>
						<span
							>Wil je je gegevens delen voor de verzameling van statistieken over zweefvliegend
							Nederland?</span
						>
					</div>
					<div class="flex-none">
						<button
							class="btn btn-sm btn-ghost"
							on:click={() => {
								shareStatsClosed = true;
							}}>Niet delen</button
						>
						<button class="btn btn-sm btn-primary" on:click={shareStats}>Gegevens delen</button>
					</div>
				{/if}
			</div>
		{/if}

		<div class="alert shadow-lg w-2/3 mx-auto">
			<div>
				<span class="text-4xl p-6">ℹ️</span>

				<span
					>Zoals met iedere data analyse is de analyse slechts zo goed als de data die erin gaat.
					Dus als je twijfelt over de uitkomst, ga zelf je data na om fouten te vinden. Alle
					klikbare statistieken geven een overzicht van de vluchten die gebruikt zijn voor de
					berekening.</span
				>
			</div>
		</div>
	{/if}
</section>

<div class="divider">Totalen</div>

<section class="statscontainer segment">
	<div class="stats shadow">
		<SingleValueCard name="Totaal starts">{statistics.flightsCount}</SingleValueCard>
		<SingleValueCard name="Totaal tijd"
			><TimeDisplay value={statistics.totalTime} /></SingleValueCard
		>
	</div>
	<div class="stats shadow">
		<SingleValueCard name="Totaal DBO starts">{statistics.dboFlightsCount}</SingleValueCard>
		<SingleValueCard name="DBO tijd"><TimeDisplay value={statistics.dboTime} /></SingleValueCard>
	</div>
	<div class="stats shadow">
		<SingleValueCard name="Totaal PIC starts">{statistics.picFlightsCount}</SingleValueCard>
		<SingleValueCard name="PIC tijd"><TimeDisplay value={statistics.picTime} /></SingleValueCard>
	</div>
	<div class="stats shadow">
		<SingleValueCard name="Totaal starts als PAX">
			<a
				href={'#'}
				on:click|preventDefault={() => {
					inspectFlights = statistics.paxFlights;
				}}>{statistics.paxFlightsCount}</a
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
	{#if statistics.xcountryFlightsCount > 0}
		<div class="stats shadow">
			<SingleValueCard name="Overland vluchten">
				<a
					href={'#'}
					on:click|preventDefault={() => {
						inspectFlights = statistics.xcountryFlights;
					}}>{statistics.xcountryFlightsCount}</a
				>
			</SingleValueCard>
			<SingleValueCard name="Overland pogingen">
				<a
					href={'#'}
					on:click|preventDefault={() => {
						inspectFlights = statistics.xcountryattemptFlights;
					}}>{statistics.xcountryattemptFlightsCount}</a
				>
			</SingleValueCard>
		</div>

		<div class="alert shadow-lg w-2/3 mx-auto">
			<div>
				<span class="text-4xl p-6">ℹ️</span>

				<span
					>Een buitenlanding is hier: een vlucht waar de plek van aankomst verschilt van de plek van
					vertrek. Als deze data niet klopt, kun je die wijzigen in de Zweef App.
				</span>
			</div>
		</div>
		<div class="stats shadow">
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
		</div>
	{:else}
		<p>Geen overland vluchten geregistreerd.</p>
	{/if}
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
			<SingleValueCard name="Totaal starts"
				>{statistics.timesAfterExam.flightsCount}</SingleValueCard
			>
			<SingleValueCard name="Totaal tijd"
				><TimeDisplay value={statistics.timesAfterExam.totalTime} /></SingleValueCard
			>
		</div>
		<div class="stats shadow">
			<SingleValueCard name="Totaal DBO starts"
				>{statistics.timesAfterExam.dboFlightsCount}</SingleValueCard
			>
			<SingleValueCard name="DBO tijd"
				><TimeDisplay value={statistics.timesAfterExam.dboTime} /></SingleValueCard
			>
		</div>
		<div class="stats shadow">
			<SingleValueCard name="Totaal PIC starts"
				>{statistics.timesAfterExam.picFlightsCount}</SingleValueCard
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
				de reglementen van je club.
			</span>
		</div>
	</div>

	<p class="mb-4">
		De bevoegdheden van je club hier zichtbaar? <a
			href="https://github.com/florisporro/zweefstats/issues"
			target="_blank">Open een issue op Github</a
		>.
	</p>

	<div class="w-full md:w-1/3 flex flex-row mx-auto mb-12">
		<div class="form-control">
			<label class="label cursor-pointer" for="verbergVereisten">
				<span class="label-text "
					>Verberg vereisten die niet vastgesteld kunnen worden met data uit de Zweef app</span
				>
			</label>
			<input
				type="checkbox"
				name="verbergVereisten"
				bind:checked={hideUnCheckedData}
				class="toggle toggle-lg"
			/>
		</div>
		<div class="form-control">
			<label for="clubSelector" class="label">
				<span class="label-text">Selecteer je club om permissies te tonen</span>
			</label>
			<select class="select w-full max-w-xs" name="clubSelector" bind:value={selectedClub}>
				{#each Object.keys(Clubs) as club}
					<option value={club}>{club}</option>
				{/each}
			</select>
		</div>
	</div>
	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
		{#if Clubs[selectedClub] !== undefined}
			{#each Clubs[selectedClub] as permission}
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
		{/if}
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
