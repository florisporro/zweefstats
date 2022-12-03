declare type FlightProps = string | number | boolean | undefined | null;

declare interface Flight {
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

declare interface Times {
	flights: Flight[];
	flightsCount: number;
	picFlights: Flight[];
	picFlightsCount: number;
	dboFlights: Flight[];
	dboFlightsCount: number;
	paxFlights: Flight[];
	paxFlightsCount: number;
	totalTime: number;
	totalTimeFormatted: string;
	picTime: number;
	picTimeFormatted: string;
	dboTime: number;
	dboTimeFormatted: string;
	paxTime: number;
	paxTimeFormatted: string;
	xcountryFlights: Flight[];
	xcountryFlightsCount: number;
	xcountryattemptFlights: Flight[];
	xcountryattemptFlightsCount: number;
}

declare interface Stats extends Times {
	pilot: string;
	timesAfterExam: Times;
	xcountryFlights: Flight[];
	xcountryattemptFlights: Flight[];
	outlandings: Flight[];
	years: FlightProps[];
	flightsByYear: { [key: string | number]: Times };
	flightsByAirfield: { [key: string | number]: Times };
	airplanes: FlightProps[];
	flightsByAirplane: { [key: string | number]: Times };
	launchMethods: FlightProps[];
	flightsByLaunchMethod: { [key: string | number]: Times };
	hasLicense: boolean;
	examFlights: Flight[];
	lastExamIndex: number;
	flightsAfterExam: Flight[];
}
