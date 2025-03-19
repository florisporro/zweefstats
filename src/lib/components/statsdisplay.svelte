<script lang="ts">
	import { getStatistics } from '../stats';
	import { saveStats } from '../saveload';
	import Clubs from '../permissions';

	import SingleValueCard from './display/singlevaluecard.svelte';
	import TimeDisplay from './display/timedisplay.svelte';
	import KeyValue from './display/keyvalue.svelte';
	import Flights from './display/Flights.svelte';
	import Popup from './popup.svelte';
	import FilterCheckboxes from './display/filtercheckboxes.svelte';

	export let data: DutchFlight[];
	let statistics: Stats;
	
	// Define the filter type
	interface DataFilters {
		showTotal: boolean;
		showPIC: boolean;
		showDBO: boolean;
		showPAX: boolean;
		showFI: boolean;
		showOverland: boolean;
		[key: string]: boolean;
	}
	
	// Display filters for columns
	let displayFilters: DataFilters = {
		showTotal: true,
		showPIC: true, 
		showDBO: true,
		showPAX: false,
		showFI: false,
		showOverland: false
	};
	
	// Track expanded/collapsed state of each section
	let expandedSections = {
		years: true,
		launchMethods: true,
		airplaneTypes: true,
		airfields: true,
		examInfo: true,
		permissionsMatrix: true,
		overland: true
	};
	
	// Define column interface
	interface DisplayColumn {
		key: string;
		name: string;
		category: 'total' | 'pic' | 'dbo' | 'pax' | 'fi' | 'overland' | 'other';
	}
	
	// Define all available columns centrally
	const allDisplayColumns: DisplayColumn[] = [
		{ key: 'flightsCount', name: 'Vluchten', category: 'total' },
		{ key: 'totalTimeFormatted', name: 'Tijd', category: 'total' },
		{ key: 'picFlightsCount', name: 'PIC Vluchten', category: 'pic' },
		{ key: 'picTimeFormatted', name: 'PIC Tijd', category: 'pic' },
		{ key: 'dboFlightsCount', name: 'DBO Vluchten', category: 'dbo' },
		{ key: 'dboTimeFormatted', name: 'DBO Tijd', category: 'dbo' },
		{ key: 'paxFlightsCount', name: 'Vluchten als PAX', category: 'pax' },
		{ key: 'paxTimeFormatted', name: 'PAX Tijd', category: 'pax' },
		{ key: 'instructorFlightsCount', name: 'FI Vluchten', category: 'fi' },
		{ key: 'instructorTimeFormatted', name: 'FI Tijd', category: 'fi' },
		{ key: 'xcountryFlightsCount', name: 'Overland vluchten', category: 'overland' },
		{ key: 'xcountryattemptFlightsCount', name: 'Overland pogingen', category: 'overland' }
	];
	
	// Get filtered display columns based on active filters
	$: displayColumns = allDisplayColumns.filter(column => {
		if (column.category === 'total') return displayFilters.showTotal;
		if (column.category === 'pic') return displayFilters.showPIC;
		if (column.category === 'dbo') return displayFilters.showDBO;
		if (column.category === 'pax') return displayFilters.showPAX;
		if (column.category === 'fi') return displayFilters.showFI;
		if (column.category === 'overland') return displayFilters.showOverland;
		return true; // Include other categories by default
	});

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
		<div class="text-slate-600 uppercase font-bold text-center mb-4">
			Statistieken voor {statistics.pilot}
		</div>
		
		<!-- Add data filter checkboxes -->
		<FilterCheckboxes statistics={statistics} bind:filters={displayFilters} />
		
		<div class="divider" />

		{#if !shareStatsClosed}
			<div class="alert alert-warning shadow-lg mb-5 md:w-2/3 mx-auto">
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

		<div class="alert alert-info shadow-lg md:w-2/3 mx-auto">
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
	{#if displayFilters.showTotal}
		<SingleValueCard name="Totaal starts">{statistics.flightsCount}</SingleValueCard>
		<SingleValueCard name="Totaal tijd"><TimeDisplay value={statistics.totalTime} /></SingleValueCard>
	{/if}
	
	{#if displayFilters.showDBO}
		<SingleValueCard name="Totaal DBO starts">{statistics.dboFlightsCount}</SingleValueCard>
		<SingleValueCard name="DBO tijd"><TimeDisplay value={statistics.dboTime} /></SingleValueCard>
	{/if}
	
	{#if displayFilters.showPIC}
		<SingleValueCard name="Totaal PIC starts">{statistics.picFlightsCount}</SingleValueCard>
		<SingleValueCard name="PIC tijd"><TimeDisplay value={statistics.picTime} /></SingleValueCard>
	{/if}
	
	{#if displayFilters.showPAX}
		<SingleValueCard name="Totaal starts als PAX">
			<a
				href={'#'}
				on:click|preventDefault={() => {
					inspectFlights = statistics.paxFlights;
				}}>{statistics.paxFlightsCount}</a
			>
		</SingleValueCard>
		<SingleValueCard name="Tijd als PAX"><TimeDisplay value={statistics.paxTime} /></SingleValueCard>
	{/if}
	
	{#if displayFilters.showFI}
		<SingleValueCard name="FI starts">
			<a
				href={'#'}
				on:click|preventDefault={() => {
					inspectFlights = statistics.instructorFlights;
				}}>{statistics.instructorFlightsCount}</a
			>
		</SingleValueCard>
		<SingleValueCard name="FI tijd"><TimeDisplay value={statistics.instructorTime} /></SingleValueCard>
	{/if}
</section>

<div class="divider">Gemiddelden</div>

<section class="statscontainer segment">
	{#if displayFilters.showTotal}
		<SingleValueCard name="Starts per dag"
			>{Math.round(statistics.averageFlightsPerDay * 100) / 100}</SingleValueCard
		>
		<SingleValueCard name="Vliegtijd per dag (min)"
			>{Math.round(statistics.averageMinutesPerDay * 100) / 100}</SingleValueCard
		>
		<SingleValueCard name="Vliegtijd per jaar"
			><TimeDisplay value={Math.round(statistics.averageMinutesYear)} /></SingleValueCard
		>
	{/if}
	
	{#if displayFilters.showPIC}
		<SingleValueCard name="PIC starts per dag"
			>{Math.round(statistics.averagePicFlightsPerDay * 100) / 100}</SingleValueCard
		>
	{/if}
	
	{#if displayFilters.showDBO}
		<SingleValueCard name="DBO starts per dag"
			>{Math.round(statistics.averageDboFlightsPerDay * 100) / 100}</SingleValueCard
		>
	{/if}
</section>

{#if displayFilters.showOverland}
	<div class="divider">
		<div class="flex items-center gap-2 cursor-pointer" 
			on:click={() => expandedSections.overland = !expandedSections.overland}
			on:keydown={(e) => e.key === 'Enter' && (expandedSections.overland = !expandedSections.overland)}
			tabindex="0"
			role="button"
			aria-expanded={expandedSections.overland}>
			<span>Overland vluchten</span>
			<span class="text-xl">{expandedSections.overland ? '🔼' : '🔽'}</span>
		</div>
	</div>

	{#if expandedSections.overland}
		{#if statistics.xcountryFlightsCount > 0}
			<div class="alert alert-info shadow-lg md:w-2/3 mb-4 mx-auto">
				<div>
					<span class="text-4xl p-6">ℹ️</span>

					<span
						>Een buitenlanding is hier: een vlucht waar de plek van aankomst verschilt van de plek van
						vertrek. Als deze data niet klopt, kun je die wijzigen in de Zweef App.
					</span>
				</div>
			</div>
			<section class="statscontainer segment transition-all duration-300">
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
				<SingleValueCard name="Laatste overland">{statistics.xcountryFlights[0].datum}</SingleValueCard>
				<SingleValueCard name="Buitenlandingen">
					<a
						href={'#'}
						on:click|preventDefault={() => {
							inspectFlights = statistics.outlandings;
						}}>{statistics.outlandings.length}</a
					>
				</SingleValueCard>
			</section>
		{:else}
			<p>Geen overland vluchten geregistreerd.</p>
		{/if}
	{/if}
{/if}

<div class="divider">
	<div class="flex items-center gap-2 cursor-pointer" 
		on:click={() => expandedSections.years = !expandedSections.years}
		on:keydown={(e) => e.key === 'Enter' && (expandedSections.years = !expandedSections.years)}
		tabindex="0"
		role="button"
		aria-expanded={expandedSections.years}>
		<span>Jaren</span>
		<span class="text-xl">{expandedSections.years ? '🔼' : '🔽'}</span>
	</div>
</div>

{#if expandedSections.years}
	<section class="segment transition-all duration-300">
		<KeyValue
			data={statistics.flightsByYear}
			bind:inspectFlights
			itemName="Jaar"
			display={displayColumns}
		/>
	</section>
{/if}

<div class="divider">
	<div class="flex items-center gap-2 cursor-pointer" 
		on:click={() => expandedSections.launchMethods = !expandedSections.launchMethods}
		on:keydown={(e) => e.key === 'Enter' && (expandedSections.launchMethods = !expandedSections.launchMethods)}
		tabindex="0"
		role="button"
		aria-expanded={expandedSections.launchMethods}>
		<span>Startmiddelen</span>
		<span class="text-xl">{expandedSections.launchMethods ? '🔼' : '🔽'}</span>
	</div>
</div>

{#if expandedSections.launchMethods}
	<section class="segment transition-all duration-300">
		<KeyValue
			data={statistics.flightsByLaunchMethod}
			bind:inspectFlights
			itemName="Startmiddel"
			display={displayColumns}
		/>
	</section>
{/if}
<div class="divider">
	<div class="flex items-center gap-2 cursor-pointer" 
		on:click={() => expandedSections.airplaneTypes = !expandedSections.airplaneTypes}
		on:keydown={(e) => e.key === 'Enter' && (expandedSections.airplaneTypes = !expandedSections.airplaneTypes)}
		tabindex="0"
		role="button"
		aria-expanded={expandedSections.airplaneTypes}>
		<span>Vliegtuigtypes</span>
		<span class="text-xl">{expandedSections.airplaneTypes ? '🔼' : '🔽'}</span>
	</div>
</div>

{#if expandedSections.airplaneTypes}
	<section class="segment transition-all duration-300">
		<KeyValue
			data={statistics.flightsByAirplane}
			bind:inspectFlights
			itemName="Type"
			display={displayColumns}
		/>
	</section>
{/if}
<div class="divider">
	<div class="flex items-center gap-2 cursor-pointer" 
		on:click={() => expandedSections.airfields = !expandedSections.airfields}
		on:keydown={(e) => e.key === 'Enter' && (expandedSections.airfields = !expandedSections.airfields)}
		tabindex="0"
		role="button"
		aria-expanded={expandedSections.airfields}>
		<span>Vliegvelden</span>
		<span class="text-xl">{expandedSections.airfields ? '🔼' : '🔽'}</span>
	</div>
</div>

{#if expandedSections.airfields}
	<section class="segment transition-all duration-300">
		<KeyValue
			data={statistics.flightsByAirfield}
			bind:inspectFlights
			itemName="Vliegveld"
			display={displayColumns}
		/>
	</section>
{/if}

<div class="divider">
	<div class="flex items-center gap-2 cursor-pointer" 
		on:click={() => expandedSections.examInfo = !expandedSections.examInfo}
		on:keydown={(e) => e.key === 'Enter' && (expandedSections.examInfo = !expandedSections.examInfo)}
		tabindex="0"
		role="button"
		aria-expanded={expandedSections.examInfo}>
		<span>Sinds laatste examenvlucht</span>
		<span class="text-xl">{expandedSections.examInfo ? '🔼' : '🔽'}</span>
	</div>
</div>

{#if expandedSections.examInfo}
	<section class="statscontainer segment transition-all duration-300">
		{#if statistics.examFlights.length > 0}
			<SingleValueCard name="Examen vluchten">
				<a
					href={'#'}
					on:click|preventDefault={() => {
						inspectFlights = statistics.examFlights;
					}}>{statistics.examFlights.length}</a
				>
			</SingleValueCard>
			<SingleValueCard name="Examen gehaald">{statistics.hasLicense ? '✅' : '❌'}</SingleValueCard>
			
			{#if displayFilters.showTotal}
				<SingleValueCard name="Totaal starts">{statistics.timesAfterExam.flightsCount}</SingleValueCard>
				<SingleValueCard name="Totaal tijd"
					><TimeDisplay value={statistics.timesAfterExam.totalTime} /></SingleValueCard
				>
			{/if}
			
			{#if displayFilters.showDBO}
				<SingleValueCard name="Totaal DBO starts"
					>{statistics.timesAfterExam.dboFlightsCount}</SingleValueCard
				>
				<SingleValueCard name="DBO tijd"
					><TimeDisplay value={statistics.timesAfterExam.dboTime} /></SingleValueCard
				>
			{/if}
			
			{#if displayFilters.showPIC}
				<SingleValueCard name="Totaal PIC starts"
					>{statistics.timesAfterExam.picFlightsCount}</SingleValueCard
				>
				<SingleValueCard name="PIC tijd"
					><TimeDisplay value={statistics.timesAfterExam.picTime} /></SingleValueCard
				>
			{/if}
			
			{#if displayFilters.showFI}
				<SingleValueCard name="Totaal FI starts"
					>{statistics.timesAfterExam.instructorFlightsCount}</SingleValueCard
				>
				<SingleValueCard name="FI tijd"
					><TimeDisplay value={statistics.timesAfterExam.instructorTime} /></SingleValueCard
				>
			{/if}
		{:else}
			<p>Geen examenvluchten geregistreerd.</p>
		{/if}
	</section>
{/if}

<div class="divider">
	<div class="flex items-center gap-2 cursor-pointer" 
		on:click={() => expandedSections.permissionsMatrix = !expandedSections.permissionsMatrix}
		on:keydown={(e) => e.key === 'Enter' && (expandedSections.permissionsMatrix = !expandedSections.permissionsMatrix)}
		tabindex="0"
		role="button"
		aria-expanded={expandedSections.permissionsMatrix}>
		<span>Bevoegdhedenmatrix</span>
		<span class="text-xl">{expandedSections.permissionsMatrix ? '🔼' : '🔽'}</span>
	</div>
</div>

{#if expandedSections.permissionsMatrix}
	<section class="segment transition-all duration-300">
		<div class="alert alert-info shadow-lg md:w-2/3 mx-auto mb-12">
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
{/if}
