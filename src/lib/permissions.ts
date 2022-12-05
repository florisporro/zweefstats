interface Requirement {
	name: string;
	goal?: number;
	calculate?: (stats: Stats) => number;
}

interface Permission {
	name: string;
	requirements: Requirement[];
}

const commonRequirements = {
	SPL: {
		name: 'SPL',
		calculate: (stats: Stats) => (stats.hasLicense ? 1 : 0)
	},
	overlesStart: {
		name: 'Twee overlesvluchten in Duo Discus waarvan een van tenminste 30 min.'
	},
	overgelest: {
		name: 'Overgelest zijn door een bevoegde instructeur.'
	},
	ls4ls8nocombine: {
		name: 'Minimaal 15 starts op type voordat de LS-4 en LS-8 door elkaar gevlogen mogen worden',
		goal: 15,
		calculate: (stats: Stats) => {
			const ls4flights = totalStartCount(stats, commonTypes.ls4);
			const ls8flights = totalStartCount(stats, commonTypes.ls8);

			if (ls4flights > 0 && ls4flights < 15) {
				return ls4flights;
			}
			if (ls8flights > 0 && ls8flights < 15) {
				return ls8flights;
			}
			return Math.min(ls4flights, ls8flights);
		}
	}
};

const commonTypes = {
	ask21: ['ASK-21', 'ASK-21(B)'],
	tweezitters: ['ASK-21', 'ASK-21(B)', 'K-13', 'K-7'],
	duo: ['Duo Discus', 'Duo Discus T', 'Duo Discus XLT'],
	ls4: ['LS-4', 'LS4', 'LS-4a', 'LS-4b'],
	ls8: ['LS-8', 'LS8', 'LS-8a', 'LS-8b']
};

// For every airplane type given, sums the total PIC starts of each type
function totalStartCount(stats: Stats, types: string[]) {
	return types.reduce((total, type) => {
		return total + (stats.flightsByAirplane[type]?.picFlightsCount || 0);
	}, 0);
}

export const permissions: Permission[] = [
	{
		name: 'ASK-21 (solo)',
		requirements: [
			{
				name: 'SPL of Aantekening van 2 bevoegde instructeurs',
				calculate: commonRequirements.SPL.calculate
			}
		]
	},
	{
		name: 'ASK-23',
		requirements: [
			{
				name: 'SPL of Solo verklaring',
				calculate: commonRequirements.SPL.calculate
			},
			{
				name: 'Aantal solovluchten in tweezitter',
				goal: 2,
				calculate: (stats) => {
					return totalStartCount(stats, commonTypes.tweezitters);
				}
			},
			{
				name: 'Overgelest door bevoegd instructeur'
			}
		]
	},
	{
		name: 'LS-4',
		requirements: [
			commonRequirements.SPL,
			{
				name: 'Twee overlesvluchten in Duo Discus waarvan een van tenminste 30 min.'
			},
			{
				name: 'Overgelest zijn op de LS-4 door een bevoegde instructeur.'
			},
			{
				name: 'Na overlessen LS8 eerst 15 starts op de LS8 voordat overgelest wordt op de LS4',
				goal: 15,
				calculate: (stats) => totalStartCount(stats, commonTypes.ls8)
			},
			commonRequirements.ls4ls8nocombine
		]
	},
	{
		name: 'LS-8',
		requirements: [
			commonRequirements.SPL,
			{
				name: 'Twee overlesvluchten in Duo Discus waarvan een van tenminste 30 min.'
			},
			{
				name: 'Overgelest zijn op de LS-4 door een bevoegde instructeur.'
			},
			{
				name: 'Na overlessen LS4 eerst 15 starts op de LS4 voordat overgelest wordt op de LS8',
				calculate: (stats) => totalStartCount(stats, commonTypes.ls4)
			},
			commonRequirements.ls4ls8nocombine
		]
	},
	{
		name: 'Duo Discus',
		requirements: [
			commonRequirements.SPL,
			{
				name: '30 vlieguren als gezagvoerder na het behalen van het LAPL/SPL',
				goal: 30,
				calculate: (stats) => stats.timesAfterExam.picTime / 60
			},
			{
				name: 'Tenminste 30 starts op de LS8 of gelijkwaardig type',
				goal: 30,
				calculate: (stats) => totalStartCount(stats, [...commonTypes.ls4, ...commonTypes.ls8])
			},
			{
				name: 'Twee goede overles starts op de Duo Discus met verschillende door de club daartoe aangewezen instructeurs'
			}
		]
	},
	{
		name: 'ASW-27',
		requirements: [
			commonRequirements.SPL,
			{
				name: '60 vlieguren als gezagvoerder na het behalen van het LAPL/SPL',
				goal: 60,
				calculate: (stats) => stats.timesAfterExam.picTime / 60
			},
			{
				name: 'Tenminste 60 starts op de LS8 / Duo Discus',
				goal: 60,
				calculate: (stats) =>
					totalStartCount(stats, [...commonTypes.ls4, ...commonTypes.ls8, ...commonTypes.duo])
			},
			{
				name: 'D-brevet'
			},
			{
				name: 'Twee goede overles starts op de Duo Discus met verschillende door de club daartoe aangewezen instructeurs (indien in bezit van een sleepaantekening dient een van de overles starts een sleepstart te zijn)'
			},
			{
				name: 'Overgelest zijn op de ASW-27 door een bevoegde instructeur.'
			}
		]
	},
	{
		name: 'ASW-29',
		requirements: [
			commonRequirements.SPL,
			{
				name: '60 vlieguren als gezagvoerder na het behalen van het LAPL/SPL',
				goal: 60,
				calculate: (stats) => stats.timesAfterExam.picTime / 60
			},
			{
				name: 'Tenminste 80 starts op de LS8 / Duo Discus / ASW-27',
				goal: 80,
				calculate: (stats) =>
					totalStartCount(stats, [
						...commonTypes.ls4,
						...commonTypes.ls8,
						...commonTypes.duo,
						'ASW-27'
					])
			},
			{
				name: '10 starts op de ASW-27',
				goal: 10,
				calculate: (stats) => totalStartCount(stats, ['ASW-27'])
			},
			{
				name: 'D-brevet'
			},
			{
				name: 'Twee goede overles starts op de Duo Discus met verschillende door de club daartoe aangewezen instructeurs (indien in bezit van een sleepaantekening dient een van de overles starts een sleepstart te zijn)'
			},
			{
				name: 'Overgelest zijn op de ASW-29 door een bevoegde instructeur.'
			}
		]
	},
	{
		name: 'Passagiersvliegen',
		requirements: [
			{
				name: 'Pax check flight by FI(s)'
			},
			{
				name: '> 10 uur of 45 starts als PIC sinds SPL (EASA)',
				calculate: (stats) => {
					if (stats.timesAfterExam.picTime / 60 > 10) return 1;
					if (stats.timesAfterExam.picFlightsCount > 45) return 1;
					return 0;
				}
			},
			{
				name: '40 PIC uren (Club)',
				goal: 40,
				calculate: (stats) => stats.picTime / 60
			},
			{
				name: '200 PIC starts (Club)',
				goal: 200,
				calculate: (stats) => stats.picFlightsCount
			},
			{
				name: '> 18 jaar'
			}
		]
	},
	{
		name: 'Aerobatics (cursus aanvang)',
		requirements: [
			{
				name: 'Na SPL tenminste 30 uur of 120 starts als PIC',
				calculate: (stats) => {
					if (stats.timesAfterExam.picTime / 60 > 30) return 1;
					if (stats.timesAfterExam.picFlightsCount > 120) return 1;
					return 0;
				}
			}
		]
	},
	{
		name: 'Motor gebruik ASW-29 Duo Discus',
		requirements: [
			commonRequirements.SPL,
			{
				name: 'Minimaal 10 overland vluchten',
				goal: 10,
				calculate: (stats) => stats.xcountryFlightsCount
			},
			{
				name: 'Minimaal 2 buitenlandingen',
				goal: 2,
				calculate: (stats) => stats.outlandings.length
			},
			{
				name: 'Theorie cursus club gevolgd'
			},
			{
				name: 'Twee goede instructie / examen starts op de Duo Discus XLT'
			},
			{
				name: 'Indien 1 t/m 4 goed gevolgd kan instructie gebruik ASG-29 worden gegeven'
			}
		]
	}
];
