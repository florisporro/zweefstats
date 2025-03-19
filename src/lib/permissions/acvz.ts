import type { Permission } from '../permissions';

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

const config: Permission[] = [
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
				name: 'Twee overlesvluchten in Duo Discus waarvan een van tenminste 30 min. Indien er eerst 15 starts op de LS4b gemaakt zijn dan vervalt de eis van 2 overlesstarts en kan voldaan worden met een overles briefing.'
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
				name: 'Twee overlesvluchten in Duo Discus waarvan een van tenminste 30 min. Indien er eerst 15 starts op de LS-8 gemaakt zijn dan vervalt de eis van 2 overlesstarts en kan voldaan worden met een overles briefing.'
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
				name: 'Tenminste 30 starts op de LS4b/LS8 of gelijkwaardig type',
				goal: 30,
				calculate: (stats) => totalStartCount(stats, [...commonTypes.ls4, ...commonTypes.ls8])
			},
			{
				name: 'Twee goede overles starts op de Duo Discus met verschillende door de club daartoe aangewezen instructeurs. Indien in het bezit van een sleepaantekening dient 1 van deze overlesstarts een vliegtuigsleepstart te zijn.'
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
				name: 'Twee goede overles starts op de Duo Discus met verschillende door de club daartoe aangewezen instructeurs. Indien in het bezit van een sleepaantekening dient 1 van deze overlesstarts een vliegtuigsleepstart te zijn.'
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
				name: 'Twee goede overles starts op de Duo Discus met verschillende door de club daartoe aangewezen instructeurs. Indien in het bezit van een sleepaantekening dient 1 van deze overlesstarts een vliegtuigsleepstart te zijn.'
			},
			{
				name: 'Overgelest zijn op de ASW-29 door een bevoegde instructeur.'
			}
		]
	},
	{
		name: 'Baby PH-190 en Prefect PH-192',
		requirements: [
			commonRequirements.SPL,
			{
				name: 'Een bevoegd verklaring in de ACvZ.zweef.app waaruit toestemming blijkt van een instructeur.'
			},
			{
				name: 'Recente briefing door instructeur of kongsihouder met ervaring op het vliegtuig'
			},
			{
				name: 'Voor de PH-190: 2 goede overlesstarts op de Rhön of een vergelijkbaar type met 2 succesvolle sliplandingen en voldoende vaardigheid in het slippen.'
			},
			{
				name: 'Toestemming en aanwezigheid van een van de kongsi leden op het vliegveld'
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
			},
			{
				name: 'Voldoen aan de eisen voor lokaal vliegen op het betreffende type.'
			},
			{
				name: 'Een goede EASA-checkstart volgens EASA.SFCL.115(a)(2)(ii)(A) met een door de club daartoe aangewezen instructeur.'
			},
			{
				name: 'Voldoen aan de SFCL eisen omtrent passagiers vliegen EASA.SFCL.115'
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
				name: 'Twee goede instructie / examen starts op de Duo Discus XLT met verschillende door de club daartoe aangewezen instructeurs.'
			},
			{
				name: 'Voor toestemming voor het motorgebruik van de ASG-29E is een aparte overlesbriefing door een daartoe aangewezen instructeur voor het motorgebruik van de ASG-29E vereist.'
			}
		]
	}
];

export default config;
