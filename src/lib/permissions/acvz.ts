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

// Common requirements for cross-country flights (overlandvluchten)
const crossCountryCommonRequirements = {
	SPL: commonRequirements.SPL,
	twoHourFlights: {
		name: 'Tenminste 2 thermiekvluchten met een vluchtduur van elk ten minste 1 uur',
		goal: 2,
		calculate: (stats: Stats) => {
			// Find flights with duration ≥ 60 minutes
			const longFlights = stats.picFlights.filter(
				(flight) => typeof flight.vluchtduur === 'number' && flight.vluchtduur >= 60
			);
			return longFlights.length;
		}
	},
	recentFlights: {
		name: 'In de voorafgaande 6 maanden tenminste tien zweefvluchten',
		goal: 10,
		calculate: (stats: Stats) => {
			// Get current date and date 6 months ago
			const now = new Date();
			const sixMonthsAgo = new Date();
			sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

			// Filter flights that occurred within the last 6 months and are not TMG flights
			const recentFlights = stats.flights.filter((flight) => {
				if (!flight.datum) return false;
				if (flight.start_methode === 'tmg') return false;
				const flightDate = new Date(flight.datum);
				return flightDate >= sixMonthsAgo && flightDate <= now;
			});

			return recentFlights.length;
		}
	},
	recentTypeStarts: {
		name: 'Minimaal twee typestarts in de laatste drie maanden op het type',
		goal: 2,
		calculate: (stats: Stats, types: string[]) => {
			// Get current date and date 3 months ago
			const now = new Date();
			const threeMonthsAgo = new Date();
			threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

			// Filter flights that occurred within the last 3 months
			// and match the specific type(s)
			const recentTypeFlights = stats.picFlights.filter((flight) => {
				if (!flight.datum || !flight.type) return false;
				const flightDate = new Date(flight.datum);
				return flightDate >= threeMonthsAgo && flightDate <= now && types.includes(flight.type);
			});

			return recentTypeFlights.length;
		}
	},
	typeStarts: {
		name: '30 starts met het betreffende type',
		goal: 30,
		calculate: (stats: Stats, types: string[]) => totalStartCount(stats, types)
	},
	threeGoodLandings: {
		name: '3 goede doellandingen met het betreffende type',
		goal: 3
	},
	overlandBriefing: {
		name: 'Overlandbriefing door een instructeur bij de eerste twee overlandvluchten'
	},
	DDIPermission: {
		name: 'Toestemming van de DDI voor iedere overlandvlucht afzonderlijk'
	}
};

const config: Permission[] = [
	// Lokale vluchten
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
				name: 'Twee overlesvluchten in Duo Discus waarvan een van tenminste 30 min. Indien er eerst 15 starts op de LS-8 gemaakt zijn dan vervalt de eis van 2 overlesstarts en kan voldaan worden met een overles briefing.'
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
				name: 'Twee overlesvluchten in Duo Discus waarvan een van tenminste 30 min. Indien er eerst 15 starts op de LS4b gemaakt zijn dan vervalt de eis van 2 overlesstarts en kan voldaan worden met een overles briefing.'
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
	},

	// Overlandvluchten
	{
		name: 'Overlandvluchten - ASK-23',
		requirements: [
			crossCountryCommonRequirements.SPL,
			crossCountryCommonRequirements.twoHourFlights,
			crossCountryCommonRequirements.recentFlights,
			{
				name: crossCountryCommonRequirements.recentTypeStarts.name,
				goal: crossCountryCommonRequirements.recentTypeStarts.goal,
				calculate: (stats) =>
					crossCountryCommonRequirements.recentTypeStarts.calculate(stats, ['ASK-23'])
			},
			{
				name: crossCountryCommonRequirements.typeStarts.name,
				goal: crossCountryCommonRequirements.typeStarts.goal,
				calculate: (stats) => crossCountryCommonRequirements.typeStarts.calculate(stats, ['ASK-23'])
			},
			crossCountryCommonRequirements.threeGoodLandings,
			crossCountryCommonRequirements.overlandBriefing,
			crossCountryCommonRequirements.DDIPermission,
			{
				name: 'Solo overland als onderdeel van SPL-opleiding: EVO, VVO1 en VVO2 syllabus volledig afgerond'
			},
			{
				name: 'Solo overland als onderdeel van SPL-opleiding: 5 opeenvolgende doellandingen op ASK-23',
				goal: 5
			},
			{
				name: 'Solo overland als onderdeel van SPL-opleiding: In bezit van "solo overland verklaring" getekend door instructeur'
			}
		]
	},
	{
		name: 'Overlandvluchten - LS-4b',
		requirements: [
			crossCountryCommonRequirements.SPL,
			crossCountryCommonRequirements.twoHourFlights,
			crossCountryCommonRequirements.recentFlights,
			{
				name: crossCountryCommonRequirements.recentTypeStarts.name,
				goal: crossCountryCommonRequirements.recentTypeStarts.goal,
				calculate: (stats) =>
					crossCountryCommonRequirements.recentTypeStarts.calculate(stats, commonTypes.ls4)
			},
			{
				name: crossCountryCommonRequirements.typeStarts.name,
				goal: crossCountryCommonRequirements.typeStarts.goal,
				calculate: (stats) =>
					crossCountryCommonRequirements.typeStarts.calculate(stats, commonTypes.ls4)
			},
			crossCountryCommonRequirements.threeGoodLandings,
			crossCountryCommonRequirements.overlandBriefing,
			crossCountryCommonRequirements.DDIPermission,
			{
				name: 'Tenminste 2 overlandvluchten',
				goal: 2,
				calculate: (stats) => {
					return stats.xcountryFlights.length;
				}
			}
		]
	},
	{
		name: 'Overlandvluchten - LS-8',
		requirements: [
			crossCountryCommonRequirements.SPL,
			crossCountryCommonRequirements.twoHourFlights,
			crossCountryCommonRequirements.recentFlights,
			{
				name: crossCountryCommonRequirements.recentTypeStarts.name,
				goal: crossCountryCommonRequirements.recentTypeStarts.goal,
				calculate: (stats) =>
					crossCountryCommonRequirements.recentTypeStarts.calculate(stats, commonTypes.ls8)
			},
			{
				name: crossCountryCommonRequirements.typeStarts.name,
				goal: crossCountryCommonRequirements.typeStarts.goal,
				calculate: (stats) =>
					crossCountryCommonRequirements.typeStarts.calculate(stats, commonTypes.ls8)
			},
			crossCountryCommonRequirements.threeGoodLandings,
			crossCountryCommonRequirements.overlandBriefing,
			crossCountryCommonRequirements.DDIPermission,
			{
				name: 'Tenminste 2 overlandvluchten',
				goal: 2,
				calculate: (stats) => {
					return stats.xcountryFlights.length;
				}
			}
		]
	},
	{
		name: 'Overlandvluchten - ASW-27',
		requirements: [
			crossCountryCommonRequirements.SPL,
			crossCountryCommonRequirements.twoHourFlights,
			crossCountryCommonRequirements.recentFlights,
			{
				name: crossCountryCommonRequirements.recentTypeStarts.name,
				goal: crossCountryCommonRequirements.recentTypeStarts.goal,
				calculate: (stats) =>
					crossCountryCommonRequirements.recentTypeStarts.calculate(stats, ['ASW-27'])
			},
			{
				name: crossCountryCommonRequirements.typeStarts.name,
				goal: crossCountryCommonRequirements.typeStarts.goal,
				calculate: (stats) => crossCountryCommonRequirements.typeStarts.calculate(stats, ['ASW-27'])
			},
			crossCountryCommonRequirements.threeGoodLandings,
			crossCountryCommonRequirements.overlandBriefing,
			crossCountryCommonRequirements.DDIPermission,
			{
				name: '4 overlandvluchten',
				goal: 4,
				calculate: (stats) => {
					return stats.xcountryFlights.length;
				}
			},
			{
				name: 'Minimaal 2 overlandvluchten van tenminste 200 kilometer'
			},
			{
				name: 'Tenminste 2 van deze overlandvluchten op LS-4b/LS-8 of gelijkwaardig type',
				goal: 2,
				calculate: (stats) => {
					const relevantFlights = stats.xcountryFlights.filter((flight) =>
						[...commonTypes.ls4, ...commonTypes.ls8].includes(flight.type || '')
					);
					return relevantFlights.length;
				}
			}
		]
	},
	{
		name: 'Overlandvluchten - ASG-29E',
		requirements: [
			crossCountryCommonRequirements.SPL,
			crossCountryCommonRequirements.twoHourFlights,
			crossCountryCommonRequirements.recentFlights,
			{
				name: crossCountryCommonRequirements.recentTypeStarts.name,
				goal: crossCountryCommonRequirements.recentTypeStarts.goal,
				calculate: (stats) =>
					crossCountryCommonRequirements.recentTypeStarts.calculate(stats, ['ASG-29E', 'ASG-29'])
			},
			{
				name: crossCountryCommonRequirements.typeStarts.name,
				goal: crossCountryCommonRequirements.typeStarts.goal,
				calculate: (stats) =>
					crossCountryCommonRequirements.typeStarts.calculate(stats, ['ASG-29E', 'ASG-29'])
			},
			crossCountryCommonRequirements.threeGoodLandings,
			crossCountryCommonRequirements.overlandBriefing,
			crossCountryCommonRequirements.DDIPermission,
			{
				name: '10 overlandvluchten',
				goal: 10,
				calculate: (stats) => stats.xcountryFlightsCount
			},
			{
				name: 'Minimaal 3 overlandvluchten van tenminste 200 kilometer'
			},
			{
				name: 'Tenminste 1 van deze overlandvluchten op ASW-27 of gelijkwaardig type',
				goal: 1,
				calculate: (stats) => {
					const relevantFlights = stats.xcountryFlights.filter(
						(flight) => flight.type === 'ASW-27'
					);
					return relevantFlights.length;
				}
			},
			{
				name: 'Bevoegd verklaring in ACvZ.zweef.app met toestemming voor motorgebruik ASG-29E'
			}
		]
	},
	{
		name: 'Overlandvluchten - ASK-21',
		requirements: [
			crossCountryCommonRequirements.SPL,
			crossCountryCommonRequirements.twoHourFlights,
			crossCountryCommonRequirements.recentFlights,
			{
				name: crossCountryCommonRequirements.recentTypeStarts.name,
				goal: crossCountryCommonRequirements.recentTypeStarts.goal,
				calculate: (stats) =>
					crossCountryCommonRequirements.recentTypeStarts.calculate(stats, commonTypes.ask21)
			},
			{
				name: crossCountryCommonRequirements.typeStarts.name,
				goal: crossCountryCommonRequirements.typeStarts.goal,
				calculate: (stats) =>
					crossCountryCommonRequirements.typeStarts.calculate(stats, commonTypes.ask21)
			},
			crossCountryCommonRequirements.threeGoodLandings,
			crossCountryCommonRequirements.overlandBriefing,
			crossCountryCommonRequirements.DDIPermission,
			{
				name: 'Bevoegd verklaring in ACvZ.zweef.app met toestemming van instructeur'
			},
			{
				name: '4 overlandvluchten',
				goal: 4,
				calculate: (stats) => {
					return stats.xcountryFlights.length;
				}
			},
			{
				name: 'Minimaal 2 overlandvluchten van tenminste 200 kilometer'
			},
			{
				name: 'Tenminste 2 van deze overlandvluchten op LS-4b/LS-8 of gelijkwaardig type',
				goal: 2,
				calculate: (stats) => {
					const relevantFlights = stats.xcountryFlights.filter((flight) =>
						[...commonTypes.ls4, ...commonTypes.ls8].includes(flight.type || '')
					);
					return relevantFlights.length;
				}
			}
		]
	},
	{
		name: 'Overlandvluchten - Duo Discus',
		requirements: [
			crossCountryCommonRequirements.SPL,
			crossCountryCommonRequirements.twoHourFlights,
			crossCountryCommonRequirements.recentFlights,
			{
				name: crossCountryCommonRequirements.recentTypeStarts.name,
				goal: crossCountryCommonRequirements.recentTypeStarts.goal,
				calculate: (stats) =>
					crossCountryCommonRequirements.recentTypeStarts.calculate(stats, commonTypes.duo)
			},
			{
				name: crossCountryCommonRequirements.typeStarts.name,
				goal: crossCountryCommonRequirements.typeStarts.goal,
				calculate: (stats) =>
					crossCountryCommonRequirements.typeStarts.calculate(stats, commonTypes.duo)
			},
			crossCountryCommonRequirements.threeGoodLandings,
			crossCountryCommonRequirements.overlandBriefing,
			crossCountryCommonRequirements.DDIPermission,
			{
				name: 'Bevoegd verklaring in ACvZ.zweef.app met toestemming van instructeur'
			},
			{
				name: '10 overlandvluchten',
				goal: 10,
				calculate: (stats) => stats.xcountryFlightsCount
			},
			{
				name: 'Minimaal 4 overlandvluchten van tenminste 200 kilometer'
			},
			{
				name: 'Minimaal 2 buitenlandingen',
				goal: 2,
				calculate: (stats) => stats.outlandings.length
			},
			{
				name: 'Bevoegd verklaring in ACvZ.zweef.app met toestemming voor motorgebruik in geval van de Duo Discus XLT'
			}
		]
	},
	{
		name: 'Overlandvluchten - Prefect PH-192',
		requirements: [
			crossCountryCommonRequirements.SPL,
			crossCountryCommonRequirements.twoHourFlights,
			crossCountryCommonRequirements.recentFlights,
			{
				name: crossCountryCommonRequirements.recentTypeStarts.name,
				goal: crossCountryCommonRequirements.recentTypeStarts.goal,
				calculate: (stats) =>
					crossCountryCommonRequirements.recentTypeStarts.calculate(stats, ['Prefect', 'PH-192'])
			},
			{
				name: crossCountryCommonRequirements.typeStarts.name,
				goal: crossCountryCommonRequirements.typeStarts.goal,
				calculate: (stats) =>
					crossCountryCommonRequirements.typeStarts.calculate(stats, ['Prefect', 'PH-192'])
			},
			crossCountryCommonRequirements.threeGoodLandings,
			crossCountryCommonRequirements.overlandBriefing,
			crossCountryCommonRequirements.DDIPermission,
			{
				name: '4 overlandvluchten',
				goal: 4,
				calculate: (stats) => {
					return stats.xcountryFlights.length;
				}
			},
			{
				name: 'Minimaal 2 overlandvluchten van tenminste 200 kilometer'
			}
		]
	}
];

export default config;
