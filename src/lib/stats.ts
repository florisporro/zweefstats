function possiblyStringRow(value: string | boolean) {
	if (typeof value === 'string') {
		return value === 'True' ? true : false;
	} else {
		return value;
	}
}

export function sanitizeData(results: Flight[]): Flight[] {
	const data: Flight[] = [];
	results.forEach((row: Flight) => {
		row.is_prive = possiblyStringRow(row.is_prive);
		row.is_fis = possiblyStringRow(row.is_fis);
		row.is_training = possiblyStringRow(row.is_training);
		row.is_examen = possiblyStringRow(row.is_examen);
		row.is_profcheck = possiblyStringRow(row.is_profcheck);
		row.is_overland = possiblyStringRow(row.is_overland);
		data.push(row);
	});
	return data;
}

export function sumTotal(array: number[]): number {
	return array.reduce((partialSum, a) => partialSum + a, 0);
}

type ObjectArrayWithNumberField = {
	[key: string]: FlightProps;
}[];

export function sumField(array: ObjectArrayWithNumberField, field: string): number {
	const fieldArray = array.map((a) => {
		if (typeof a[field] === 'number') {
			return a[field];
		}
		return 0;
	}) as number[];
	const sum = sumTotal(fieldArray);
	return sum;
}

type dateType = string | number | Date;

type ObjectArrayWithDate = {
	[key: string]: dateType;
}[];

export function filterByDateRange(
	array: ObjectArrayWithDate,
	datefield: string,
	start: dateType,
	end: dateType
) {
	return array.filter((item) => {
		const date = new Date(item[datefield]).getTime();
		const startDate = new Date(start).getTime();
		const endDate = new Date(end).getTime();
		return date >= startDate && date <= endDate;
	});
}

export function getCalendarYear(date: dateType) {
	date = new Date(date);
	const year = date.getFullYear();
	const calendarYear = {
		start: new Date(year, 0, 1, 0, 0, 1),
		end: new Date(year, 11, 31, 23, 59, 59)
	};
	return calendarYear;
}

export function getLastYear(date: dateType) {
	date = new Date(date);
	const year = date.getFullYear();

	return new Date(date.setFullYear(year - 1));
}

export function getLastMonth(date: dateType) {
	date = new Date(date);
	const prevMonth = date.getMonth() - 1;

	return new Date(date.getFullYear(), prevMonth, date.getDay());
}

export function topKFrequent(items: string[]) {
	const hash: { [key: string]: number } = {};

	for (const item of items) {
		if (!hash[item]) hash[item] = 0;
		hash[item]++;
	}

	const hashToArray = Object.entries(hash);
	const sortedArray = hashToArray.sort((a, b) => b[1] - a[1]);
	return sortedArray.map((a) => a[0]);
}

export function getUnique(data: { [key: string]: FlightProps }[], property: string) {
	return [...new Set(data.map((item) => item[property]))];
}

export function formatTime(time: number) {
	const hours = Math.floor(time / 60);
	const minutes = time % 60;
	return `${hours} uur en ${minutes} minuten`;
}

export function getTimes(data: Flight[], pilot: string): Times {
	// Find all flights where pilot was PIC
	const picFlights = data.filter((a) => a.gezagvoerder_naam === pilot);

	// Find all flights where pilot was DBO
	const dboFlights = data.filter(
		(a) => a.tweede_inzittende_naam === pilot && (a.is_training === true || a.is_fis === true)
	);

	// Find all flights where pilot was PAX
	const paxFlights = data.filter(
		(a) => a.tweede_inzittende_naam === pilot && a.is_training === false && a.is_fis === false
	);

	// Sum flight time by category
	const totalTime = sumField(data, 'vluchtduur');
	const picTime = sumField(picFlights, 'vluchtduur');
	const dboTime = sumField(dboFlights, 'vluchtduur');
	const paxTime = sumField(paxFlights, 'vluchtduur');

	const totalTimeFormatted = formatTime(totalTime);
	const picTimeFormatted = formatTime(picTime);
	const dboTimeFormatted = formatTime(dboTime);
	const paxTimeFormatted = formatTime(paxTime);

	// Find all xcountry flights for pilot
	const xcountryFlights = picFlights.filter((a) => a.is_overland === true && a.vluchtduur > 33);

	// Find all xcountry attempts flights for pilot
	const xcountryattemptFlights = picFlights.filter(
		(a) => a.is_overland === true && a.vluchtduur < 33
	);

	return {
		flights: data,
		flightsCount: sumField(data, 'starts'),
		picFlights,
		picFlightsCount: sumField(picFlights, 'starts'),
		dboFlights,
		dboFlightsCount: sumField(dboFlights, 'starts'),
		paxFlights,
		paxFlightsCount: sumField(paxFlights, 'starts'),
		totalTime,
		picTime,
		dboTime,
		paxTime,
		totalTimeFormatted,
		picTimeFormatted,
		dboTimeFormatted,
		paxTimeFormatted,
		xcountryFlights,
		xcountryFlightsCount: sumField(xcountryFlights, 'starts'),
		xcountryattemptFlights,
		xcountryattemptFlightsCount: sumField(xcountryattemptFlights, 'starts')
	};
}

function averageFlightProperty(property: string, timesObject: FlightsBy) {
	// Create an array from the object with the property
	const valuesArray = Object.values(timesObject).map((a) => a[property]) as number[];
	// Remove zero values
	const filteredArray = valuesArray.filter((a) => a > 0);
	// Calculate average
	return filteredArray.reduce((a, b) => a + b, 0) / filteredArray.length;
}

export function getStatistics(data: Flight[]): Stats {
	// Find the most likely name of the pilot
	const pilots: string[] = [
		...data.map((a) => (typeof a.gezagvoerder_naam === 'string' ? a.gezagvoerder_naam : '')),
		...data.map((a) =>
			typeof a.tweede_inzittende_naam === 'string' ? a.tweede_inzittende_naam : ''
		)
	];

	const mostLikelyPilot = topKFrequent(pilots);
	const pilot = mostLikelyPilot[0];

	const complete = getTimes(data, pilot);

	// Find all flights where arrival airfield was buitenlanding
	const outlandings = data.filter((a) => a.aankomst_vliegveld !== a.vertrek_vliegveld);

	// Find all exam flights
	const examFlights = data.filter((a) => a.is_examen);

	// Get all flights after the last exam flights
	const lastExamIndex = data.indexOf(examFlights[0]);
	const flightsAfterExam = data.slice(0, lastExamIndex);

	const timesAfterExam = getTimes(flightsAfterExam, pilot);

	// Get flights by date
	const dates = getUnique(data, 'datum');
	const flightsByDate: Stats['flightsByDate'] = {};
	for (const date of dates) {
		if (typeof date === 'string' || typeof date === 'number') {
			const flightsThisDate = data.filter((a) => a.datum === date);
			flightsByDate[date] = getTimes(flightsThisDate, pilot);
		}
	}

	const averageFlightsPerDay = averageFlightProperty('flightsCount', flightsByDate);
	const averagePicFlightsPerDay = averageFlightProperty('picFlightsCount', flightsByDate);
	const averageDboFlightsPerDay = averageFlightProperty('dboFlightsCount', flightsByDate);
	const averageMinutesPerDay = averageFlightProperty('totalTime', flightsByDate);

	// Get flights by year
	const years = getUnique(data, 'year');
	const flightsByYear: Stats['flightsByYear'] = {};
	for (const year of years) {
		if (typeof year === 'string' || typeof year === 'number') {
			const flightsThisYear = data.filter((a) => a.year === year);
			flightsByYear[year] = getTimes(flightsThisYear, pilot);
		}
	}

	const averageStartsYear = averageFlightProperty('flightsCount', flightsByYear);
	const averageMinutesYear = averageFlightProperty('totalTime', flightsByYear);
	const averagePicStartsYear = averageFlightProperty('flightsCount', flightsByYear);

	// Get flights by type of airplane
	let airplanes = getUnique(data, 'type');
	airplanes = airplanes.sort();
	const flightsByAirplane: Stats['flightsByAirplane'] = {};
	for (const airplane of airplanes) {
		if (typeof airplane === 'string') {
			const flightsThisType = data.filter((a) => a.type === airplane);
			flightsByAirplane[airplane] = getTimes(flightsThisType, pilot);
		}
	}

	// Get flights by launch method
	let launchMethods = getUnique(data, 'start_methode');
	launchMethods = launchMethods.sort();
	const flightsByLaunchMethod: Stats['flightsByLaunchMethod'] = {};
	for (const launchMethod of launchMethods) {
		if (typeof launchMethod === 'string') {
			const flightsThisType = data.filter((a) => a.start_methode === launchMethod);
			flightsByLaunchMethod[launchMethod] = getTimes(flightsThisType, pilot);
		}
	}

	// Get flights by departure airfield
	let airfields = getUnique(data, 'vertrek_vliegveld');
	airfields = airfields.sort();
	const flightsByAirfield: Stats['flightsByAirfield'] = {};
	for (const airfield of airfields) {
		if (typeof airfield === 'string') {
			const flightsThisAirfield = data.filter((a) => a.vertrek_vliegveld === airfield);
			flightsByAirfield[airfield] = getTimes(flightsThisAirfield, pilot);
		}
	}

	// Make some educated guesses on whether pilot has a license
	let hasLicense = false;
	if (airplanes.includes('LS-8a')) hasLicense = true;
	if (airplanes.includes('LS-4b')) hasLicense = true;
	if (airplanes.includes('ASG-29')) hasLicense = true;

	return {
		pilot,
		...complete,
		outlandings,
		dates,
		flightsByDate,
		averageFlightsPerDay,
		averagePicFlightsPerDay,
		averageDboFlightsPerDay,
		averageMinutesPerDay,
		years,
		flightsByYear,
		averageStartsYear,
		averagePicStartsYear,
		averageMinutesYear,
		flightsByAirfield,
		airplanes,
		flightsByAirplane,
		launchMethods,
		flightsByLaunchMethod,
		hasLicense,
		examFlights,
		lastExamIndex,
		flightsAfterExam,
		timesAfterExam
	};
}
