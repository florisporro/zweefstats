import type { Flight, FlightProps } from './interface';

export function sanitizeData(results: Flight[]): Flight[] {
	const data: Flight[] = [];
	results.forEach((row: Flight) => {
		row.is_prive === 'True' ? (row.is_prive = true) : (row.is_prive = false);
		row.is_fis === 'True' ? (row.is_fis = true) : (row.is_fis = false);
		row.is_training === 'True' ? (row.is_training = true) : (row.is_training = false);
		row.is_examen === 'True' ? (row.is_examen = true) : (row.is_examen = false);
		row.is_profcheck === 'True' ? (row.is_profcheck = true) : (row.is_profcheck = false);
		row.is_overland === 'True' ? (row.is_overland = true) : (row.is_overland = false);
		data.push(row);
	});
	return data;
}

export function sumTotal(array: number[]): number {
	return array.reduce((partialSum, a) => partialSum + a, 0);
}

type ObjectArrayWithNumberField = {
	[key: string]: FlightProps;
}[]

export function sumField(array: ObjectArrayWithNumberField, field: string): number {
	const fieldArray = array.map(a => {
		if (typeof a[field] === 'number') {
			return a[field];
		}
		return 0
	}) as number[];
	const sum = sumTotal(fieldArray)
	return sum
}

type dateType = string | number | Date;

type ObjectArrayWithDate = {
	[key: string]: dateType;
}[]

export function filterByDateRange(array: ObjectArrayWithDate, datefield: string, start: dateType, end: dateType) {
	return array.filter(item => {
		const date = new Date(item[datefield]).getTime()
		const startDate = new Date(start).getTime()
		const endDate = new Date(end).getTime()
		return date >= startDate && date <= endDate;
	})
}

export function getCalendarYear(date: dateType) {
	date = new Date(date);
	const year = date.getFullYear();
	const calendarYear = {
		start: new Date(year, 0, 1, 0, 0, 1),
		end: new Date(year, 11, 31, 23, 59, 59)
	}
	return calendarYear
}

export function getLastYear(date: dateType) {
	date = new Date(date)
	const year = date.getFullYear();

	return new Date(date.setFullYear(year - 1))
}

export function getLastMonth(date: dateType) {
	date = new Date(date);
	const prevMonth = date.getMonth() - 1;

	return new Date(date.getFullYear(), prevMonth, date.getDay());
}

export function topKFrequent(items: (string)[]) {
	const hash: { [key: string]: number } = {}

	for (const item of items) {
		if (!hash[item]) hash[item] = 0
		hash[item]++
	}

	const hashToArray = Object.entries(hash)
	const sortedArray = hashToArray.sort((a, b) => b[1] - a[1])
	return sortedArray.map(a => a[0])
}

export function getUnique(data: { [key: string]: FlightProps }[], property: string) {
	return [...new Set(data.map((item) => item[property]))];
}

export interface Times {
	picFlights: Flight[];
	dboFlights: Flight[];
	paxFlights: Flight[];
	totalTime: number;
	picTime: number;
	dboTime: number;
	paxTime: number;
}

export function getTimes(data: Flight[], pilot: string): Times {
	// Find all flights where pilot was PIC
	const picFlights = data.filter(a => a.gezagvoerder_naam === pilot)

	// Find all flights where pilot was DBO
	const dboFlights = data.filter(a => a.tweede_inzittende_naam === pilot && a.is_training === true)

	// Find all flights where pilot was PAX
	const paxFlights = data.filter(a => a.tweede_inzittende_naam === pilot && a.is_training === false)

	// Sum flight time by category
	const totalTime = sumField(data, 'vluchtduur')
	const picTime = sumField(picFlights, 'vluchtduur')
	const dboTime = sumField(dboFlights, 'vluchtduur')
	const paxTime = sumField(paxFlights, 'vluchtduur')

	return {
		picFlights,
		dboFlights,
		paxFlights,
		totalTime,
		picTime,
		dboTime,
		paxTime
	}
}

export interface Stats extends Times {
	pilot: string;
	timesAfterExam: Times,
	xcountryFlights: Flight[],
	xcountryattemptFlights: Flight[],
	outlandings: Flight[],
	years: string[],
	flightsByYear: Flight[][],
	airplanes: string[],
	flightsByAirplane: Flight[][],
	hasLicense: boolean,
	examFlights: Flight[],
	lastExamIndex: number,
	flightsAfterExam: Flight[],
}

export function getStatistics(data: Flight[]): Stats {
	// Find the most likely name of the pilot
	const pilots: string[] = [
		...data.map(a => typeof a.gezagvoerder_naam === "string" ? a.gezagvoerder_naam : ""),
		...data.map(a => typeof a.tweede_inzittende_naam === "string" ? a.tweede_inzittende_naam : "")
	]

	const mostLikelyPilot = topKFrequent(pilots)
	const pilot = mostLikelyPilot[0]

	const complete = getTimes(data, pilot)

	// Find all xcountry flights for pilot
	const xcountryFlights = data.filter(a => a.is_overland === true && a.vluchtduur > 33)

	// Find all xcountry attempts flights for pilot
	const xcountryattemptFlights = data.filter(a => a.is_overland === true && a.vluchtduur < 33)

	// Find all flights where arrival airfield was buitenlanding
	const outlandings = data.filter(a => a.aankomst_vliegveld === 'buitenlanding')

	// Find all exam flights
	const examFlights = data.filter(a => a.is_examen)

	// Get all flights after the last exam flights
	const lastExamIndex = data.indexOf(examFlights[0])
	const flightsAfterExam = data.slice(0, lastExamIndex)

	const timesAfterExam = getTimes(flightsAfterExam, pilot)

	// Get flights by year
	const years = getUnique(data, 'year')
	const flightsByYear = years.map(year => {
		return data.filter(a => a.year === year)
	})

	// Get flights by airplane
	const airplanes = getUnique(data, 'type')
	const flightsByAirplane = airplanes.map(airplane => {
		return data.filter(a => a.type === airplane)
	})

	let hasLicense = false
	if (airplanes.includes("LS-8a")) hasLicense = true
	if (airplanes.includes("LS-4b")) hasLicense = true
	if (airplanes.includes("ASG-29")) hasLicense = true

	return {
		pilot,
		...complete,
		timesAfterExam,
		xcountryFlights,
		xcountryattemptFlights,
		outlandings,
		years,
		flightsByYear,
		airplanes,
		flightsByAirplane,
		hasLicense,
		examFlights,
		lastExamIndex,
		flightsAfterExam,
	}
}