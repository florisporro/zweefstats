import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { sanitizeData } from '$lib/sanitize';

export const trailingSlash = 'ignore';

export const load = (async () => {
	const rawData: string | null = sessionStorage.getItem('history');
	let json, sanitizedData: DutchFlight[];
	if (rawData === null) throw error(400, 'Geen data ingeladen');

	if (rawData !== null) {
		json = JSON.parse(rawData);
		sanitizedData = sanitizeData(json);
		if (json === undefined) throw error(500, 'Niet mogelijk om data in te laden');
		if (sanitizedData === undefined) throw error(500, 'Niet mogelijk om data in te laden');
		return { sanitizedData };
	}
}) satisfies PageLoad;
