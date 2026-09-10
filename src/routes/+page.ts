import type { PageLoad } from './$types';
import { getStats } from '$lib/saveload';

export const load = (async () => {
	try {
		const stats = await getStats();
		return {
			stats
		};
	} catch {
		return {};
	}
}) satisfies PageLoad;
