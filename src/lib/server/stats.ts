import { getStatistics, formatTime } from '../stats';

export interface FlightData {
	key: string;
	pilot: string;
	pilotId: number;
	club: string | undefined;
	data: DutchFlight[];
}

// Sums all the values in an array
function sumTotal(array: number[]) {
	return array.reduce((partialSum, a) => partialSum + a, 0);
}

// Gets an average of all the values in an array
function averageArray(array: number[]) {
	const sanitizedArray = array.map((value) => {
		const number = Number(value);
		if (isNaN(number)) return 0;
		return number;
	});
	return sanitizedArray.reduce((a, b) => Number(a) + Number(b), 0) / array.length;
}

/**
 * A shared record is only usable if it actually carries a flight array. One
 * malformed entry used to throw here and take the whole rebuild down with it,
 * which silently froze the national statistics.
 */
function isUsable(record: FlightData): boolean {
	return Array.isArray(record?.data);
}

export function compileAverages(data: FlightData[]): NationalStatistics {
	const usable = data.filter(isUsable);

	// Process all the data into our statistics object
	const stats = usable.map((a) => getStatistics(a.data));

	const pilots = usable.length;
	const flightsCount = sumTotal(stats.map((a) => a.flights.length));
	const picFlightsCount = sumTotal(stats.map((a) => a.picFlights.length));
	const dboFlightsCount = sumTotal(stats.map((a) => a.dboFlights.length));
	const paxFlightsCount = sumTotal(stats.map((a) => a.paxFlights.length));
	const totalTime = sumTotal(stats.map((a) => a.totalTime));
	const totalTimeFormatted = formatTime(totalTime);
	const picTime = sumTotal(stats.map((a) => a.picTime));
	const picTimeFormatted = formatTime(picTime);
	const dboTime = sumTotal(stats.map((a) => a.dboTime));
	const dboTimeFormatted = formatTime(dboTime);
	const paxTime = sumTotal(stats.map((a) => a.paxTime));
	const paxTimeFormatted = formatTime(paxTime);

	const averageFlightsPerDay = averageArray(stats.map((a) => a.averageFlightsPerDay));
	const averagePicFlightsPerDay = averageArray(stats.map((a) => a.averagePicFlightsPerDay));
	const averageDboFlightsPerDay = averageArray(stats.map((a) => a.averageDboFlightsPerDay));
	const averageMinutesPerDay = averageArray(stats.map((a) => a.averageMinutesPerDay));
	const averageStartsYear = averageArray(stats.map((a) => a.averageStartsYear as number));
	const averagePicStartsYear = averageArray(stats.map((a) => a.averagePicStartsYear as number));
	const averageMinutesYear = averageArray(stats.map((a) => a.averageMinutesYear as number));

	return {
		pilots,
		flightsCount,
		picFlightsCount,
		dboFlightsCount,
		paxFlightsCount,
		totalTime,
		totalTimeFormatted,
		picTime,
		picTimeFormatted,
		dboTime,
		dboTimeFormatted,
		paxTime,
		paxTimeFormatted,
		averageFlightsPerDay,
		averagePicFlightsPerDay,
		averageDboFlightsPerDay,
		averageMinutesPerDay,
		averageStartsYear,
		averagePicStartsYear,
		averageMinutesYear
	};
}

const FLIGHTS_PREFIX = 'flights ';
const STATS_KEY = 'stats';
const UPDATED_AT_KEY = 'statsUpdatedAt';

// ponytail: time-debounce, switch to a queue if writes get bursty
const MIN_RECOMPUTE_INTERVAL_MS = 15 * 60 * 1000;

/**
 * KV reads are eventually consistent, so a record written moments ago may be
 * missing from a listing, or come back stale. Override by key.
 */
export function mergeFresh(records: FlightData[], fresh: FlightData): FlightData[] {
	return [...records.filter((record) => record.key !== fresh.key), fresh];
}

async function listAllFlightData(kv: KVNamespace): Promise<FlightData[]> {
	const names: string[] = [];
	let cursor: string | undefined;

	for (;;) {
		const page = await kv.list({ prefix: FLIGHTS_PREFIX, cursor });
		names.push(...page.keys.map((key) => key.name));
		if (page.list_complete) break;
		cursor = page.cursor;
	}

	const records = await Promise.all(names.map((name) => kv.get<FlightData>(name, 'json')));
	return records.filter((record): record is FlightData => record !== null);
}

export function readNationalStats(kv: KVNamespace): Promise<string | null> {
	return kv.get(STATS_KEY);
}

export function saveFlightData(kv: KVNamespace, record: FlightData): Promise<void> {
	return kv.put(FLIGHTS_PREFIX + record.key, JSON.stringify(record));
}

/**
 * Rebuilds the cached national statistics from every shared logbook. Runs on
 * write rather than on a schedule, so it is debounced against write bursts.
 */
export async function recomputeNationalStats(kv: KVNamespace, fresh?: FlightData): Promise<void> {
	const lastRun = Number((await kv.get(UPDATED_AT_KEY)) ?? 0);
	if (Date.now() - lastRun < MIN_RECOMPUTE_INTERVAL_MS) return;

	const records = await listAllFlightData(kv);
	const stats = compileAverages(fresh ? mergeFresh(records, fresh) : records);

	await kv.put(STATS_KEY, JSON.stringify(stats));
	await kv.put(UPDATED_AT_KEY, String(Date.now()));
}
