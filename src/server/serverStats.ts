import { getStatistics, formatTime } from '../lib/stats';

interface FlightData {
	key: string;
	pilot: string;
	pilotId: number;
	club: string | undefined;
	data: DutchFlight[];
}

interface NationalStatistics {
	pilots: number;
	flightsCount: number;
	picFlightsCount: number;
	dboFlightsCount: number;
	paxFlightsCount: number;
	totalTime: number;
	totalTimeFormatted: string;
	picTime: number;
	picTimeFormatted: string;
	dboTime: number;
	dboTimeFormatted: string;
	paxTime: number;
	paxTimeFormatted: string;
	averageFlightsPerDay: number;
	averagePicFlightsPerDay: number;
	averageDboFlightsPerDay: number;
	averageMinutesPerDay: number;
	averageStartsYear: number;
	averagePicStartsYear: number;
	averageMinutesYear: number;
}

// Sums all the values in an array
function sumTotal(array: number[]) {
	return array.reduce((partialSum, a) => partialSum + a, 0);
}

// Sums all the values of an array of objects with a number key
function sumField(array: { [key: string]: number }[], field: string) {
	const fieldArray = array.map((a) => Number(a[field]));
	const sum = sumTotal(fieldArray);
	return sum;
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

export function compileAverages(data: FlightData[]): NationalStatistics {
	// Process all the data into our statistics object
	const stats = data.map((a) => getStatistics(a.data));

	const pilots = data.length;
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
