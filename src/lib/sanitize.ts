// Helper function to determine if a Flight object uses English or Dutch properties
function isEnglishFlight(flight: Flight): flight is EnglishFlight {
	return 'date' in flight || 'registration' in flight || 'departure_airport' in flight;
}

// Helper function to convert any value to boolean
function convertToBoolean(value: any): boolean {
	if (typeof value === 'boolean') return value;
	if (value === 'true' || value === 'True' || value === 1 || value === '1') return true;
	return false;
}

// Helper function to standardize a flight to Dutch format
function standardizeToDutch(flight: Flight): DutchFlight {
	if (!isEnglishFlight(flight)) {
		return flight as DutchFlight; // Already in Dutch format
	}
	
	const englishFlight = flight as EnglishFlight;
	
	// Create a new Dutch flight object
	const dutchFlight = {
		uuid: englishFlight.uuid,
		datum: englishFlight.date,
		year: englishFlight.year,
		volg_nummer: englishFlight.number,
		date_created: englishFlight.date_created,
		date_updated: englishFlight.date_updated,
		is_prive: englishFlight.is_private,
		vertrek_vliegveld: englishFlight.departure_airport,
		aankomst_vliegveld: englishFlight.arrival_airport,
		callsign: englishFlight.callsign,
		registratie: englishFlight.registration,
		type: englishFlight.type,
		sleep_uuid: englishFlight.tow_uuid,
		gezagvoerder_id: englishFlight.pic_id,
		gezagvoerder_naam: englishFlight.pic_name,
		tweede_inzittende_id: englishFlight.passenger_id,
		tweede_inzittende_naam: englishFlight.passenger_name,
		betalend_lid_id: englishFlight.paying_member_id,
		start_methode: englishFlight.start_method,
		category: englishFlight.category,
		is_fis: englishFlight.is_fis,
		is_training: englishFlight.is_training,
		is_examen: englishFlight.is_exam,
		is_profcheck: englishFlight.is_profcheck,
		is_overland: englishFlight.is_crosscountry,
		afstand: englishFlight.distance,
		starts: englishFlight.starts,
		start_tijd: englishFlight.departure_time,
		landings_tijd: englishFlight.arrival_time,
		vluchtduur: englishFlight.flightduration,
		blocktime: englishFlight.blocktime,
		height: englishFlight.height,
		bijzonderheden: englishFlight.remarks,
		notitie: englishFlight.notes
	} as DutchFlight;
	
	return dutchFlight;
}

export function sanitizeData(results: Flight[]): DutchFlight[] {
	const data: DutchFlight[] = [];
	console.log(`Sanitizing ${results.length} rows...`);
	
	// Log first row to see the raw format
	if (results.length > 0) {
		console.log('First row example:', results[0]);
	}
	
	results.forEach((originalRow: Flight, index) => {
		try {
			// Standardize to Dutch format
			const row = standardizeToDutch(originalRow);
			
			// Check if all required fields exist
			if (!row.datum) {
				console.error(`Row ${index} missing date field:`, row);
				return; // Skip this row
			}

			// Handle boolean fields correctly - apply a strict conversion
			row.is_prive = convertToBoolean(row.is_prive);
			row.is_fis = convertToBoolean(row.is_fis);
			row.is_training = convertToBoolean(row.is_training);
			row.is_examen = convertToBoolean(row.is_examen);
			row.is_profcheck = convertToBoolean(row.is_profcheck);
			row.is_overland = convertToBoolean(row.is_overland);
			
			// Check if datum is in expected format
			if (row.datum && typeof row.datum === 'string' && row.datum.split('-').length !== 3) {
				console.error(`Row ${index} has invalid date format:`, row.datum);
			}
			
			// Ensure year is set
			if (!row.year && row.datum && typeof row.datum === 'string') {
				row.year = Number(row.datum.split('-')[0]);
			}
			
			// Ensure vluchtduur is a number
			if (row.vluchtduur !== undefined && isNaN(Number(row.vluchtduur))) {
				console.error(`Row ${index} has invalid vluchtduur:`, row.vluchtduur);
			} else if (row.vluchtduur !== undefined) {
				row.vluchtduur = Number(row.vluchtduur);
			}
			
			// Ensure required fields aren't undefined but null instead
			if (row.tweede_inzittende_naam === undefined) row.tweede_inzittende_naam = null;
			if (row.tweede_inzittende_id === undefined) row.tweede_inzittende_id = null;
			
			// If this is one of the first rows, log it for debugging
			if (index < 3) {
				console.log(`Sanitized row ${index}:`, {
					vluchtduur: row.vluchtduur,
					is_fis: row.is_fis,
					is_training: row.is_training,
					is_examen: row.is_examen,
					is_profcheck: row.is_profcheck,
					is_overland: row.is_overland,
					gezagvoerder_naam: row.gezagvoerder_naam,
					tweede_inzittende_naam: row.tweede_inzittende_naam
				});
			}
			
			data.push(row);
		} catch (error) {
			console.error(`Error in row ${index}:`, originalRow);
			console.error(error);
		}
	});
	
	console.log(`Successfully processed ${data.length} out of ${results.length} rows`);
	return data;
}