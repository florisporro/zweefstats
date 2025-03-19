<script lang="ts">
	// Define the filter type
	interface DataFilters {
		showTotal?: boolean;
		showPIC?: boolean;
		showDBO?: boolean;
		showPAX?: boolean;
		showFI?: boolean;
		showOverland?: boolean;
		[key: string]: boolean | undefined;
	}

	export let statistics: any;

	// Define filter options
	const filterOptions = [
		{ id: 'showPIC', label: 'PIC vluchten', defaultShow: true, alwaysShow: false },
		{ id: 'showDBO', label: 'DBO vluchten', defaultShow: true, alwaysShow: false },
		{ id: 'showPAX', label: 'Vluchten als PAX', defaultShow: false, alwaysShow: false },
		{ id: 'showFI', label: 'FI vluchten', defaultShow: false, alwaysShow: false },
		{ id: 'showOverland', label: 'Overland vluchten', defaultShow: false, alwaysShow: false }
	];

	// Helper function to determine if a filter should be shown based on flight data
	function shouldShowFilter(filterId: string): boolean {
		// Basic defaults based on filter configuration
		const option = filterOptions.find((opt) => opt.id === filterId);
		let shouldShow = option?.defaultShow || false;

		// Data-based defaults
		if (filterId === 'showPIC') {
			shouldShow = statistics.picFlightsCount > 0;
		} else if (filterId === 'showDBO') {
			shouldShow = statistics.dboFlightsCount > 0;
		} else if (filterId === 'showPAX') {
			shouldShow = statistics.paxFlightsCount > 0;
		} else if (filterId === 'showFI') {
			shouldShow = statistics.instructorFlightsCount > 0;
		} else if (filterId === 'showOverland') {
			shouldShow = statistics.xcountryFlightsCount > 0;
		}

		return shouldShow;
	}

	// Generate filter state based on statistics
	export let filters: DataFilters = {
		showTotal: true,
		showPIC: true,
		showDBO: true,
		showPAX: false,
		showFI: false,
		showOverland: false
	};

	// Track if filters have been manually changed by the user
	let filtersManuallyChanged = false;

	// Set initial filters based on flight data
	$: if (statistics && !filtersManuallyChanged) {
		// Create a new filters object based on flight data
		const dataBasedFilters: DataFilters = {
			showTotal: true, // Always show total
			showPIC: shouldShowFilter('showPIC'),
			showDBO: shouldShowFilter('showDBO'),
			showPAX: shouldShowFilter('showPAX'),
			showFI: shouldShowFilter('showFI'),
			showOverland: shouldShowFilter('showOverland')
		};

		// Only update if the filters would actually change
		const wouldChange = filterOptions.some(
			(option) => filters[option.id] !== dataBasedFilters[option.id]
		);

		if (wouldChange) {
			filters = dataBasedFilters;
		}
	}

	function toggleFilter(filterId: string) {
		// Mark filters as manually changed
		filtersManuallyChanged = true;

		filters = {
			...filters,
			[filterId]: !filters[filterId]
		};
	}
</script>

<div class="flex flex-wrap gap-4 justify-center mb-8 p-4 bg-base-200 rounded-lg">
	{#each filterOptions as option}
		{@const isDisabled = option.alwaysShow}
		{@const noFlights =
			(option.id === 'showPIC' && statistics.picFlightsCount === 0) ||
			(option.id === 'showDBO' && statistics.dboFlightsCount === 0) ||
			(option.id === 'showPAX' && statistics.paxFlightsCount === 0) ||
			(option.id === 'showFI' && statistics.instructorFlightsCount === 0) ||
			(option.id === 'showOverland' && statistics.xcountryFlightsCount === 0)}

		<label
			class="flex items-center gap-2 cursor-pointer {noFlights ? 'opacity-50' : ''}"
			class:cursor-not-allowed={isDisabled}
		>
			<input
				type="checkbox"
				class="checkbox checkbox-secondary"
				checked={filters[option.id]}
				on:change={() => toggleFilter(option.id)}
				disabled={isDisabled || noFlights}
			/>
			<span class="label-text">{option.label}{noFlights ? ' (0)' : ''}</span>
		</label>
	{/each}
</div>
