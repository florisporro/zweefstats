declare type FlightProps = string | number | boolean | undefined | null;

declare interface DutchFlight {
	[key: string]: FlightProps;
	uuid: string;
	datum: string;
	year: number;
	volg_nummer: number;
	date_created: string;
	date_updated: string;
	is_prive: boolean | string;
	vertrek_vliegveld: string;
	aankomst_vliegveld: string;
	callsign: string;
	registratie: string;
	type: string;
	sleep_uuid: string | null;
	gezagvoerder_id: number | null;
	gezagvoerder_naam: string | null;
	tweede_inzittende_id: number | null;
	tweede_inzittende_naam: string | null;
	betalend_lid_id: number | null;
	start_methode: string;
	category: string | null;
	is_fis: boolean | string;
	is_training: boolean | string;
	is_examen: boolean | string;
	is_profcheck: boolean | string;
	is_overland: boolean | string;
	afstand: number;
	starts: number;
	start_tijd: string;
	landings_tijd: string;
	vluchtduur: number;
	blocktime: number;
	height: number;
	bijzonderheden: string | null;
	notitie: string | null;
}

declare interface EnglishFlight {
	[key: string]: FlightProps;
	uuid: string;
	date: string;
	year: number;
	number: number;
	date_created: string;
	date_updated: string;
	is_private: boolean | string;
	departure_airport: string;
	arrival_airport: string;
	callsign: string;
	registration: string;
	type: string;
	tow_uuid: string | null;
	pic_id: number | null;
	pic_name: string | null;
	passenger_id: number | null;
	passenger_name: string | null;
	paying_member_id: number | null;
	start_method: string;
	category: string | null;
	is_fis: boolean | string;
	is_training: boolean | string;
	is_exam: boolean | string;
	is_profcheck: boolean | string;
	is_crosscountry: boolean | string;
	distance: number;
	starts: number;
	departure_time: string;
	arrival_time: string;
	flightduration: number;
	blocktime: number;
	height: number;
	remarks: string | null;
	notes: string | null;
	signed_date: string | null;
	signed_cert: string | null;
	signed_remark: string | null;
}

declare type Flight = DutchFlight | EnglishFlight;

declare interface FlightsBy {
	[key: string | number]: Times;
}

declare interface Times {
	[key: string]: Flight[] | number | string;
	flights: Flight[];
	flightsCount: number;
	picFlights: Flight[];
	picFlightsCount: number;
	dboFlights: Flight[];
	dboFlightsCount: number;
	paxFlights: Flight[];
	paxFlightsCount: number;
	instructorFlights: Flight[];
	instructorFlightsCount: number;
	totalTime: number;
	totalTimeFormatted: string;
	picTime: number;
	picTimeFormatted: string;
	dboTime: number;
	dboTimeFormatted: string;
	paxTime: number;
	paxTimeFormatted: string;
	instructorTime: number;
	instructorTimeFormatted: string;
	xcountryFlights: Flight[];
	xcountryFlightsCount: number;
	xcountryattemptFlights: Flight[];
	xcountryattemptFlightsCount: number;
}

declare interface Stats extends Times {
	[key: string]: Flight[] | FlightsBy | FlightProps[] | Times | number | string | boolean | null | undefined;
	pilot: string;
	pilotId: number | null;
	timesAfterExam: Times;
	xcountryFlights: Flight[];
	xcountryattemptFlights: Flight[];
	outlandings: Flight[];
	dates: FlightProps[];
	flightsByDate: FlightsBy;
	averageFlightsPerDay: number;
	averagePicFlightsPerDay: number;
	averageDboFlightsPerDay: number;
	averageMinutesPerDay: number;
	averageMinutesYear: number;
	years: FlightProps[];
	flightsByYear: FlightsBy;
	flightsByAirfield: FlightsBy;
	airplanes: FlightProps[];
	flightsByAirplane: FlightsBy;
	launchMethods: FlightProps[];
	flightsByLaunchMethod: FlightsBy;
	hasLicense: boolean;
	examFlights: Flight[];
	lastExamIndex: number;
	flightsAfterExam: Flight[];
}
