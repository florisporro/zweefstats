import { describe, expect, it } from 'vitest';
import { compileAverages, mergeFresh, type FlightData } from './stats';

function record(key: string, flights: Partial<DutchFlight>[]): FlightData {
	return {
		key,
		pilot: key,
		pilotId: Number(key.split(' ')[0]),
		club: 'acvz',
		data: flights as DutchFlight[]
	};
}

const flight = (uuid: string, extra: Partial<DutchFlight> = {}) =>
	({
		uuid,
		datum: '2022-10-29',
		year: 2022,
		start_tijd: '10:00',
		landings_tijd: '10:30',
		vluchtduur: 30,
		is_fis: false,
		start_methode: 'lier',
		type: 'LS-8a',
		vertrek_vliegveld: 'EHSB',
		aankomst_vliegveld: 'EHSB',
		...extra
	}) as Partial<DutchFlight>;

describe('mergeFresh', () => {
	it('replaces a stale copy of the same key rather than double counting it', () => {
		const stale = record('1 Pilot', [flight('a')]);
		const fresh = record('1 Pilot', [flight('a'), flight('b')]);

		const merged = mergeFresh([stale, record('2 Other', [flight('c')])], fresh);

		expect(merged).toHaveLength(2);
		expect(merged.find((r) => r.key === '1 Pilot')?.data).toHaveLength(2);
	});

	it('appends a record that the listing has not caught up with yet', () => {
		const fresh = record('2 Other', [flight('c')]);

		const merged = mergeFresh([record('1 Pilot', [flight('a')])], fresh);

		expect(merged.map((r) => r.key).sort()).toEqual(['1 Pilot', '2 Other']);
	});
});

describe('compileAverages', () => {
	it('counts pilots and flights across every shared logbook', () => {
		const stats = compileAverages([
			record('1 Pilot', [flight('a'), flight('b')]),
			record('2 Other', [flight('c')])
		]);

		expect(stats.pilots).toBe(2);
		expect(stats.flightsCount).toBe(3);
		expect(stats.totalTime).toBeGreaterThan(0);
		expect(stats.totalTimeFormatted).toBeTypeOf('string');
	});

	it('does not double count a logbook that merge deduplicated', () => {
		const stale = record('1 Pilot', [flight('a')]);
		const fresh = record('1 Pilot', [flight('a'), flight('b')]);

		const stats = compileAverages(mergeFresh([stale], fresh));

		expect(stats.pilots).toBe(1);
		expect(stats.flightsCount).toBe(2);
	});
});
