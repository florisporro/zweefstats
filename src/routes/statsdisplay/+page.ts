import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { sanitizeData } from '$lib/sanitize';

export const trailingSlash = 'ignore';

export const load = (async () => {
	const rawData: string | null = sessionStorage.getItem('history');
	if (rawData === null) error(400, 'Geen data ingeladen');

	const json = JSON.parse(rawData);
	if (json === undefined) error(500, 'Niet mogelijk om data in te laden');

	const sanitizedData: DutchFlight[] = sanitizeData(json);
	if (sanitizedData === undefined) error(500, 'Niet mogelijk om data in te laden');

	return { sanitizedData };
}) satisfies PageLoad;
