import type { PageLoad } from './$types';
import { getStats } from '$lib/saveload';

export const load = (async ({ fetch, url }) => {
	const stats = await getStats();
	return {
		stats
	};
}) satisfies PageLoad;
