// export_history.json?personal=True&format=json

import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { goto } from '$app/navigation';
import { PUBLIC_ZWEEFAPP_BASE_URL } from '$env/static/public'

export const trailingSlash = 'ignore';

export const load = (async ({ fetch, url }) => {
	const sessionStorageValue = sessionStorage.getItem('zweefapp');
	const parsedsessionStorage = sessionStorageValue ? JSON.parse(sessionStorageValue) : null;
	const token = url.searchParams.get('token') || parsedsessionStorage?.token;
	const club = url.searchParams.get('club') || parsedsessionStorage?.club;

	// First, check if the club and token parameters are set
	// if they are, store in sessionStorage and remove from url
	if (url.searchParams.get('token') || url.searchParams.get('club')) {
		sessionStorage.setItem('zweefapp', JSON.stringify({club, token}));
		goto(`/load/zweefapp/`, { replaceState: true })
	}

	if (!token || !club) {
		return;
	}

	const requestHeaders: HeadersInit = new Headers();
	requestHeaders.set('Accept', 'application/json');
	requestHeaders.set('Content-Type', 'application/json');
	requestHeaders.set('Authorization', 'Bearer ' + token);

	const api_url = `${PUBLIC_ZWEEFAPP_BASE_URL}${club}/internal_api`;
	const history = await fetch(`${api_url}/flights/export_history.json?personal=True&format=json`, {
		method: 'GET',
		headers: requestHeaders
	});

	const historyJson = await history.json();

	console.log({
		history: historyJson,
	})

	sessionStorage.setItem('history', JSON.stringify(historyJson));

	goto(`/statsdisplay`, { replaceState: false }) 
}) satisfies PageLoad;
