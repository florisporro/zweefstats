import { dev } from '$app/environment';

let baseUrl = 'https://api.zweefstats.nl/';
if (dev) baseUrl = 'http://localhost:8010/proxy';

export const getStats = async () => {
	const requestHeaders: HeadersInit = new Headers();
	requestHeaders.set('Accept', 'application/json');
	requestHeaders.set('Content-Type', 'application/json');

	const response = await fetch(`${baseUrl}`, {
		method: 'GET',
		headers: requestHeaders
	});

	const json = await response.json();
	return json;
};

export const saveStats = async (data: Stats, club: string | undefined) => {
	const requestHeaders: HeadersInit = new Headers();
	requestHeaders.set('Accept', 'application/json');
	requestHeaders.set('Content-Type', 'application/json');

	const key = `${data.pilotId} ${data.pilot}`;

	const string = JSON.stringify({
		pilot: data.pilot,
		pilotId: data.pilotId,
		key,
		club,
		data: data.flights
	});

	const response = await fetch(baseUrl, {
		method: 'POST',
		headers: requestHeaders,
		body: string
	});
	const json = await response.json();
	return json;
};
