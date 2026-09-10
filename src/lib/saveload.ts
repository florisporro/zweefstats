const endpoint = '/api/stats';

export const getStats = async (): Promise<NationalStatistics | null> => {
	const response = await fetch(endpoint, {
		method: 'GET',
		headers: { Accept: 'application/json' }
	});

	return response.json();
};

export const saveStats = async (data: Stats, club: string | undefined) => {
	const key = `${data.pilotId} ${data.pilot}`;

	const response = await fetch(endpoint, {
		method: 'POST',
		headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
		body: JSON.stringify({
			pilot: data.pilot,
			pilotId: data.pilotId,
			key,
			club,
			data: data.flights
		})
	});

	return response.json();
};
