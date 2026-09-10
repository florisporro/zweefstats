import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import {
	readNationalStats,
	recomputeNationalStats,
	saveFlightData,
	type FlightData
} from '$lib/server/stats';

function kvOf(platform: App.Platform | undefined) {
	const kv = platform?.env?.zweefstats;
	if (!kv) error(503, 'KV binding unavailable');
	return kv;
}

export const GET: RequestHandler = async ({ platform }) => {
	const stats = await readNationalStats(kvOf(platform));
	if (stats === null) return json(null);

	return new Response(stats, {
		headers: { 'content-type': 'application/json;charset=UTF-8' }
	});
};

export const POST: RequestHandler = async ({ request, platform }) => {
	const kv = kvOf(platform);
	const record = (await request.json()) as FlightData;

	if (!record?.key) error(400, 'Missing key');

	await saveFlightData(kv, record);

	// The response does not wait on the rebuild.
	platform?.context?.waitUntil(recomputeNationalStats(kv, record));

	return json({ key: record.key });
};
