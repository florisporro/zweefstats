import { compileAverages } from './serverStats';
interface CFListResponse {
	keys: { name: string }[];
	list_complete: boolean;
	cursor: string;
}

export default {
	async scheduled(event: Event, env: Bindings) {
		const { zweefstats } = env;

		async function fetchKeyList(
			keys: { name: string }[] | undefined,
			cursor: string | undefined
		): Promise<{ name: string }[]> {
			keys = keys || [];
			const response = await zweefstats.list({ prefix: 'flights', cursor });
			keys = [...keys, ...response.keys];
			if (response.list_complete) {
				return keys;
			} else {
				return fetchKeyList(keys, response.cursor);
			}
		}

		async function fetchKeys(keys: string[]) {
			const promises = keys.map(async (key) => {
				const data = await zweefstats.get(key);
				return JSON.parse(data);
			});
			return await Promise.all(promises);
		}

		const keys = await fetchKeyList(undefined, undefined);
		const data = await fetchKeys(keys.map((key) => key.name));
		const stats = compileAverages(data);

		// Cache the stats in a KV store
		await zweefstats.put('stats', JSON.stringify(stats));
	},

	async fetch(request: Request, env: Bindings) {
		const { zweefstats } = env;
		const method = request?.method?.toUpperCase?.();

		const responseHeaders = new Headers();
		responseHeaders.set('Access-Control-Allow-Origin', 'https://zweefstats.nl');
		responseHeaders.set('Access-Control-Allow-Methods', 'GET,HEAD,POST,OPTIONS');
		responseHeaders.set('Access-Control-Max-Age', '86400');
		if (typeof request.headers.get('Access-Control-Request-Headers') === 'string') {
			responseHeaders.set(
				'Access-Control-Allow-Headers',
				request.headers.get('Access-Control-Request-Headers') as string
			);
		}
		responseHeaders.set('content-type', 'application/json;charset=UTF-8');

		if (request.method === 'OPTIONS') {
			return new Response(null, {
				headers: responseHeaders
			});
		}

		if (method === 'GET') {
			const stats = await zweefstats.get('stats');

			return new Response(stats, {
				headers: responseHeaders
			});
		}
		if (method === 'POST') {
			const json = await request.json();

			await zweefstats.put('flights ' + json.key, JSON.stringify(json));

			return new Response(JSON.stringify({ key: json.key, json }, null, 2), {
				status: 200,
				headers: responseHeaders
			});
		}
	}
};
