// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

export function sanitizeData(results) {
	const data = [];
	results.data.forEach((row) => {
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

export function sumTotal(array) {
	return array.reduce((partialSum, a) => partialSum + a, 0);
}

export function sumField(array, field) {
	const fieldArray = array.map(a => Number(a[field]))
	const sum = sumTotal(fieldArray)
	return sum
}

export function filterByDateRange(array, start, end) {
	return array.filter(item => {
		let date = new Date(item.Date).getTime()
		let startDate = new Date(start).getTime()
		let endDate = new Date(end).getTime()
		return date >= startDate && date <= endDate;
	})
}

export function getCalendarYear(date) {
	date = new Date(date);
	let year = date.getFullYear();
	let calendarYear = {
		start: new Date(year, 0, 1, 0, 0, 1),
		end: new Date(year, 11, 31, 23, 59, 59)
	}
	return calendarYear
}

export function getLastYear(date) {
	date = new Date(date)
	let year = date.getFullYear();

	return new Date(date.setYear(year - 1))
}

export function getLastMonth(date) {
	date = new Date(date);
	const prevMonth = date.getMonth() - 1;

	return new Date(date.getFullYear(), prevMonth, date.getDay());
}

export function topKFrequent(items) {
	let hash = {}

	for (let item of items) {
		if (!hash[item]) hash[item] = 0
		hash[item]++
	}

	const hashToArray = Object.entries(hash)
	const sortedArray = hashToArray.sort((a, b) => b[1] - a[1])
	return sortedArray.map(a => a[0])
}

export function getUnique(data, property) {
	return [...new Set(data.map((item) => item[property]))];
}

export function getStatistics(data) {
	// Find the most likely name of the pilot
	const pilots = [
		...data.map(a => a.gezagvoerder_naam),
		...data.map(a => a.tweede_inzittende_naam)
	]

	const mostLikelyPilot = topKFrequent(pilots)
	const pilot = mostLikelyPilot[0]

	// Find all flights where pilot was PIC
	const picFlights = data.filter(a => a.gezagvoerder_naam === pilot)

	// Find all flights where pilot was DBO
	const dboFlights = data.filter(a => a.tweede_inzittende_naam === pilot && a.is_training === true)

	// Find all flights where pilot was PAX
	const paxFlights = data.filter(a => a.tweede_inzittende_naam === pilot && a.is_training === false)

	// Find all xcountry flights for pilot
	const xcountryFlights = data.filter(a => a.is_overland === true && a.vluchtduur > 33)

	// Find all xcountry attempts flights for pilot
	const xcountryattemptFlights = data.filter(a => a.is_overland === true && a.vluchtduur < 33)

	// Find all flights where arrival airfield was buitenlanding
	const outlandings = data.filter(a => a.aankomst_vliegveld === 'buitenlanding')

	// Get flights by year
	const years = getUnique(data, 'year')
	const flightsByYear = years.map(year => {
		return data.filter(a => a.year === year)
	})

	// Sum flight time by category
	const picTime = sumField(picFlights, 'vluchtduur')
	const dboTime = sumField(dboFlights, 'vluchtduur')
	const paxTime = sumField(paxFlights, 'vluchtduur')

	return {
		pilot,
		picFlights,
		dboFlights,
		paxFlights,
		xcountryFlights,
		xcountryattemptFlights,
		outlandings,
		flightsByYear,
		picTime,
		dboTime,
		paxTime
	}
}