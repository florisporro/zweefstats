import type { Permission } from '../permissions';
import { airframeGroups } from '../airframes';

const commonTypes = airframeGroups;

// For every airplane type given, sums the total PIC starts of each type
function totalStartCount(stats: Stats, types: string[]) {
	return types.reduce((total, type) => {
		return total + (stats.flightsByAirplane[type]?.picFlightsCount || 0);
	}, 0);
}

// Number of cross-country flights of at least the given distance in km (field `afstand`).
// Clubreglement v14.6 §4.3 asks for a minimum number of 200 km or 300 km flights per type.
function longXcountryFlightCount(stats: Stats, km: number) {
	return stats.typeXcountryFlights.filter((flight) => Number(flight.afstand) >= km).length;
}

// An ICAO airport code is 4 capital letters. The first letter is the ICAO region, and the
// letters I, J, Q and X are not assigned to any region (e.g. EHSB, EDLE, LFOI are valid).
const icaoAirportCode = /^[A-HK-PR-WYZ][A-Z]{3}$/;

// Outlandings whose arrival field is not an airfield. zweef.app logs an airfield by its ICAO
// code (e.g. EHSB) and a field outside an airfield by its place name. Only a valid ICAO code
// counts as an airfield; an empty arrival field still counts as an outlanding.
function outlandingsAwayFromAirfields(stats: Stats) {
	return stats.outlandings.filter((flight) => {
		const arrival = typeof flight.aankomst_vliegveld === 'string' ? flight.aankomst_vliegveld.trim() : '';
		return !icaoAirportCode.test(arrival);
	}).length;
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
				if (typeof flight.datum !== 'string') return false;
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
				if (typeof flight.datum !== 'string' || typeof flight.type !== 'string') return false;
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
	},
	// Clubreglement v14.6 §4.3.1
	typeEndorsement: {
		name: 'Bevoegd verklaring in de ACvZ.zweef.app met overland toestemming voor het betreffende type van een bevoegde ACvZ instructeur'
	},
	// Clubreglement v14.6 §4.3.1
	rigging: {
		name: 'Ervaring met het monteren en demonteren van het betreffende type, alsmede het plaatsen in de aanhangwagen'
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
			},
			{
				// Clubreglement v14.6 §4.2.4
				name: 'Een volledig afgetekende EVO progressiekaart in de ACvZ.zweef.app'
			},
			{
				// Clubreglement v14.6 §4.2.4
				name: 'Aantekening in het logboek en een SOLO bevoegd verklaring in de ACvZ.zweef.app waaruit toestemming blijkt van twee bevoegde instructeurs'
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
				// Clubreglement v14.6 §4.2.5: "bij voorkeur", so recommended, not required
				name: 'Aantal solovluchten in tweezitter (aanbevolen)',
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
				// Clubreglement v14.6 §4.2.6
				name: 'Twee goede overlesstarts op de Duo Discus met verschillende door de club daartoe aangewezen instructeurs, waarvan een thermische vlucht van minimaal 30 min. Indien er eerst 15 starts op de LS-8 gemaakt zijn dan vervalt de eis van 2 overlesstarts en kan voldaan worden met een overles briefing.'
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
				// Clubreglement v14.6 §4.2.7
				name: 'Twee goede overlesstarts op de Duo Discus met verschillende door de club daartoe aangewezen instructeurs, waarvan een thermische vlucht van minimaal 30 min. Indien er eerst 15 starts op de LS4b gemaakt zijn dan vervalt de eis van 2 overlesstarts en kan voldaan worden met een overles briefing.'
			},
			{
				// Clubreglement v14.6 §4.2.7
				name: 'Overgelest zijn op de LS-8 door een bevoegde instructeur.'
			},
			{
				name: 'Na overlessen LS4 eerst 15 starts op de LS4 voordat overgelest wordt op de LS8',
				goal: 15,
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
			},
			{
				// Clubreglement v14.6 §4.2.8
				name: 'Overgelest zijn op de Duo Discus door een bevoegde instructeur.'
			}
		]
	},
	{
		name: 'Arcus T',
		requirements: [
			commonRequirements.SPL,
			{
				name: '80 vlieguren als gezagvoerder na het behalen van het LAPL/SPL',
				goal: 80,
				calculate: (stats) => stats.timesAfterExam.picTime / 60
			},
			{
				// Clubreglement v14.6 §4.2.11: the ASG-29 counts as an equivalent type, as it does for
				// the "20 starts op de ASW-27 en/of ASG29" requirement below
				name: 'Tenminste 100 starts op de LS-8 / Duo Discus (XLT) / ASW-27 / ASG-29 of gelijkwaardig type',
				goal: 100,
				calculate: (stats) =>
					totalStartCount(stats, [
						...commonTypes.ls4,
						...commonTypes.ls8,
						...commonTypes.duo,
						...commonTypes.asw27,
						...commonTypes.asg29
					])
			},
			{
				name: 'Tenminste 20 starts op de Duo Discus (XLT)',
				goal: 20,
				calculate: (stats) => totalStartCount(stats, [...commonTypes.duo])
			},
			{
				name: 'Tenminste 20 starts op de ASW-27 en/of ASG29',
				goal: 20,
				calculate: (stats) => totalStartCount(stats, [...commonTypes.asw27, ...commonTypes.asg29])
			},
			{
				name: 'D-brevet'
			},
			{
				name: 'Sleepaantekening'
			},
			{
				name: 'Een goede overles starts op de Arcus T met door de club daartoe aangewezen instructeur.'
			},
			{
				name: 'Twee goede checkvluchten op de Arcus T met door de club daartoe aangewezen instructeurs. Een van deze starts dient een sleepstart te zijn.'
			},
			{
				// Clubreglement v14.6 §4.2.11. Not met: a check flight in the Arcus T with an Arcus
				// instructor is required, which itself counts as a DBO flight.
				name: 'Minimaal 1 Arcus PIC/DBO vlucht in de afgelopen 90 dagen.',
				goal: 1,
				calculate: (stats) => {
					const now = new Date();
					const ninetyDaysAgo = new Date();
					ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

					return [...stats.picFlights, ...stats.dboFlights].filter((flight) => {
						if (typeof flight.datum !== 'string' || typeof flight.type !== 'string') return false;
						const flightDate = new Date(flight.datum);
						return (
							flightDate >= ninetyDaysAgo &&
							flightDate <= now &&
							commonTypes.arcus.includes(flight.type)
						);
					}).length;
				}
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
				// Clubreglement v14.6 §4.2.10
				name: 'Tenminste 60 starts op de LS4b / LS8 / Duo Discus of gelijkwaardig type',
				goal: 60,
				calculate: (stats) =>
					totalStartCount(stats, [...commonTypes.ls4, ...commonTypes.ls8, ...commonTypes.duo])
			},
			{
				name: 'D-brevet'
			},
			{
				// Clubreglement v14.6 §4.2.10 / §4.2.2: overlesstarts voor de ASW-27 op de Arcus T
				name: 'Twee goede overles starts op de Arcus T met verschillende door de club daartoe aangewezen instructeurs. Indien in het bezit van een sleepaantekening dient 1 van deze overlesstarts een vliegtuigsleepstart te zijn.'
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
						...commonTypes.asw27
					])
			},
			{
				name: '10 starts op de ASW-27',
				goal: 10,
				calculate: (stats) => totalStartCount(stats, commonTypes.asw27)
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
				// EASA.SFCL.115(a)(2)(ii)(A): "at least 10 hours of flight time or 30 launches or take-offs
				// and landings as PIC on sailplanes" after the issue of the SPL. A powered sailplane (and so
				// a TMG) is a sailplane in this regulation, so TMG flights count here.
				// https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:02018R1976-20211115
				name: 'Minimaal 10 uur of 30 starts als PIC sinds SPL (EASA.SFCL.115)',
				calculate: (stats) => {
					if (stats.timesAfterExam.picTime / 60 >= 10) return 1;
					if (stats.timesAfterExam.picFlightsCount >= 30) return 1;
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
			},
			{
				// Clubreglement v14.6 §4.2.14: for passenger flights the recency of EASA.SFCL.160(e)
				// always applies: at least 3 launches as PIC in sailplanes (no TMG) in the last 90 days.
				// EASA.SFCL.160(e)(1): "three launches in sailplanes, excluding TMGs"
				// https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:02018R1976-20211115
				name: 'Minimaal 3 starts als gezagvoerder in de afgelopen 90 dagen (zweefvliegtuig, geen TMG)',
				goal: 3,
				calculate: (stats) => {
					const now = new Date();
					const ninetyDaysAgo = new Date();
					ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

					return stats.picFlights
						.filter((flight) => {
							if (typeof flight.datum !== 'string') return false;
							if (flight.start_methode === 'tmg') return false;
							const flightDate = new Date(flight.datum);
							return flightDate >= ninetyDaysAgo && flightDate <= now;
						})
						.reduce((total, flight) => total + (typeof flight.starts === 'number' ? flight.starts : 0), 0);
				}
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
		name: 'Motor gebruik DuoDiscus XLT en Arcus T',
		requirements: [
			commonRequirements.SPL,
			{
				// Clubreglement v14.6 §4.2.13: "10 overlandvluchten". Counts starts (sum of the starts field)
				name: 'Minimaal 10 overland vluchten',
				goal: 10,
				calculate: (stats) => stats.typeXcountryFlightsCount
			},
			{
				// Clubreglement v14.6 §4.2.13: "Een landing op een ander vliegveld geldt in deze niet
				// als buitenlanding."
				name: 'Minimaal 2 buitenlandingen, niet op een ander vliegveld',
				goal: 2,
				calculate: (stats) => outlandingsAwayFromAirfields(stats)
			},
			{
				name: 'Theorie cursus club gevolgd'
			},
			{
				// Clubreglement v14.6 §4.2.13
				name: 'Twee goede instructie / examen starts op de Duo Discus XLT of Arcus T met verschillende door de club daartoe aangewezen turbo instructeurs.'
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
					crossCountryCommonRequirements.recentTypeStarts.calculate(stats, commonTypes.ask23)
			},
			{
				name: crossCountryCommonRequirements.typeStarts.name,
				goal: crossCountryCommonRequirements.typeStarts.goal,
				calculate: (stats) =>
					crossCountryCommonRequirements.typeStarts.calculate(stats, commonTypes.ask23)
			},
			crossCountryCommonRequirements.threeGoodLandings,
			crossCountryCommonRequirements.overlandBriefing,
			crossCountryCommonRequirements.DDIPermission,
			crossCountryCommonRequirements.typeEndorsement,
			crossCountryCommonRequirements.rigging,
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
			crossCountryCommonRequirements.typeEndorsement,
			crossCountryCommonRequirements.rigging,
			{
				// Clubreglement v14.6 §4.3.3: "Tenminste 2 overlandvluchten". Counts flights (logbook rows)
				name: 'Tenminste 2 overlandvluchten',
				goal: 2,
				calculate: (stats) => {
					return stats.typeXcountryFlights.length;
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
			crossCountryCommonRequirements.typeEndorsement,
			crossCountryCommonRequirements.rigging,
			{
				// Clubreglement v14.6 §4.3.4: "Tenminste 2 overlandvluchten". Counts flights (logbook rows)
				name: 'Tenminste 2 overlandvluchten',
				goal: 2,
				calculate: (stats) => {
					return stats.typeXcountryFlights.length;
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
					crossCountryCommonRequirements.recentTypeStarts.calculate(stats, commonTypes.asw27)
			},
			{
				name: crossCountryCommonRequirements.typeStarts.name,
				goal: crossCountryCommonRequirements.typeStarts.goal,
				calculate: (stats) => crossCountryCommonRequirements.typeStarts.calculate(stats, commonTypes.asw27)
			},
			crossCountryCommonRequirements.threeGoodLandings,
			crossCountryCommonRequirements.overlandBriefing,
			crossCountryCommonRequirements.DDIPermission,
			crossCountryCommonRequirements.typeEndorsement,
			crossCountryCommonRequirements.rigging,
			{
				// Clubreglement v14.6 §4.3.5: "4 overlandvluchten waarvan minimaal 2 van tenminste 200 kilometer". Counts flights (logbook rows)
				name: '4 overlandvluchten',
				goal: 4,
				calculate: (stats) => {
					return stats.typeXcountryFlights.length;
				}
			},
			{
				name: 'Minimaal 2 overlandvluchten van tenminste 200 kilometer',
				goal: 2,
				calculate: (stats) => longXcountryFlightCount(stats, 200)
			},
			{
				// Clubreglement v14.6 §4.3.5: "Tenminste 2 van deze overlandvluchten" on a LS-4b/LS-8 or equivalent type
				name: 'Tenminste 2 van deze overlandvluchten op LS-4b/LS-8 of gelijkwaardig type',
				goal: 2,
				calculate: (stats) => {
					const relevantFlights = stats.typeXcountryFlights.filter((flight) =>
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
					crossCountryCommonRequirements.recentTypeStarts.calculate(stats, commonTypes.asg29)
			},
			{
				name: crossCountryCommonRequirements.typeStarts.name,
				goal: crossCountryCommonRequirements.typeStarts.goal,
				calculate: (stats) =>
					crossCountryCommonRequirements.typeStarts.calculate(stats, commonTypes.asg29)
			},
			crossCountryCommonRequirements.threeGoodLandings,
			crossCountryCommonRequirements.overlandBriefing,
			crossCountryCommonRequirements.DDIPermission,
			{
				// ASG-29E: no cross-country paragraph in Clubreglement v14.6. Counts starts (sum of the starts field)
				name: '10 overlandvluchten',
				goal: 10,
				calculate: (stats) => stats.typeXcountryFlightsCount
			},
			{
				name: 'Minimaal 3 overlandvluchten van tenminste 200 kilometer',
				goal: 3,
				calculate: (stats) => longXcountryFlightCount(stats, 200)
			},
			{
				// ASG-29E: no cross-country paragraph in Clubreglement v14.6
				name: 'Tenminste 1 van deze overlandvluchten op ASW-27 of gelijkwaardig type',
				goal: 1,
				calculate: (stats) => {
					const relevantFlights = stats.typeXcountryFlights.filter(
						(flight) => commonTypes.asw27.includes(flight.type || '')
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
		// Clubreglement v14.6 §4.3.9
		name: 'Overlandvluchten - Arcus T',
		requirements: [
			crossCountryCommonRequirements.SPL,
			crossCountryCommonRequirements.twoHourFlights,
			crossCountryCommonRequirements.recentFlights,
			{
				name: crossCountryCommonRequirements.recentTypeStarts.name,
				goal: crossCountryCommonRequirements.recentTypeStarts.goal,
				calculate: (stats) =>
					crossCountryCommonRequirements.recentTypeStarts.calculate(stats, commonTypes.arcus)
			},
			{
				name: crossCountryCommonRequirements.typeStarts.name,
				goal: crossCountryCommonRequirements.typeStarts.goal,
				calculate: (stats) =>
					crossCountryCommonRequirements.typeStarts.calculate(stats, commonTypes.arcus)
			},
			crossCountryCommonRequirements.threeGoodLandings,
			crossCountryCommonRequirements.overlandBriefing,
			crossCountryCommonRequirements.DDIPermission,
			crossCountryCommonRequirements.typeEndorsement,
			crossCountryCommonRequirements.rigging,
			{
				// Clubreglement v14.6 §4.3.9: "12 overlandvluchten waarvan minimaal 3 van tenminste 300 kilometer". Counts starts (sum of the starts field)
				name: '12 overlandvluchten',
				goal: 12,
				calculate: (stats) => stats.typeXcountryFlightsCount
			},
			{
				name: 'Minimaal 3 overlandvluchten van tenminste 300 kilometer',
				goal: 3,
				calculate: (stats) => longXcountryFlightCount(stats, 300)
			},
			{
				// Clubreglement v14.6 §4.3.9: "Tenminste 2 van deze overlandvluchten" on a Duo Discus (XLT)
				name: 'Tenminste 2 van deze overlandvluchten op een Duo Discus (XLT)',
				goal: 2,
				calculate: (stats) =>
					stats.typeXcountryFlights.filter((flight) =>
						commonTypes.duo.includes(flight.type || '')
					).length
			},
			{
				name: 'Bevoegd verklaring in ACvZ.zweef.app met toestemming voor motorgebruik Arcus T'
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
			crossCountryCommonRequirements.typeEndorsement,
			crossCountryCommonRequirements.rigging,
			{
				// Clubreglement v14.6 §4.3.6: "de eisen zoals gesteld voor de ASW 27" (§4.3.5: "4 overlandvluchten"). Counts flights (logbook rows)
				name: '4 overlandvluchten',
				goal: 4,
				calculate: (stats) => {
					return stats.typeXcountryFlights.length;
				}
			},
			{
				name: 'Minimaal 2 overlandvluchten van tenminste 200 kilometer',
				goal: 2,
				calculate: (stats) => longXcountryFlightCount(stats, 200)
			},
			{
				// Clubreglement v14.6 §4.3.6 via §4.3.5: "Tenminste 2 van deze overlandvluchten" on a LS-4b/LS-8 or equivalent type
				name: 'Tenminste 2 van deze overlandvluchten op LS-4b/LS-8 of gelijkwaardig type',
				goal: 2,
				calculate: (stats) => {
					const relevantFlights = stats.typeXcountryFlights.filter((flight) =>
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
			crossCountryCommonRequirements.typeEndorsement,
			crossCountryCommonRequirements.rigging,
			{
				// Clubreglement v14.6 §4.3.7: "10 overlandvluchten waarvan minimaal 4 van tenminste 200 kilometer". Counts starts (sum of the starts field)
				name: '10 overlandvluchten',
				goal: 10,
				calculate: (stats) => stats.typeXcountryFlightsCount
			},
			{
				name: 'Minimaal 4 overlandvluchten van tenminste 200 kilometer',
				goal: 4,
				calculate: (stats) => longXcountryFlightCount(stats, 200)
			},
			{
				name: 'Minimaal 2 buitenlandingen',
				goal: 2,
				calculate: (stats) => stats.outlandings.length
			},
			{
				name: 'Bevoegd verklaring in ACvZ.zweef.app met toestemming voor motorgebruik in geval van de Duo Discus XLT'
			},
			{
				// Clubreglement v14.6 §4.3.7
				name: 'Let op: bij overlandvluchten tijdens het reguliere vliegbedrijf vanaf Soesterberg of tijdens clubkampen dient de tweede inzittende een SPL-houder te zijn die lid is van de ACvZ.'
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
					crossCountryCommonRequirements.recentTypeStarts.calculate(stats, commonTypes.prefect)
			},
			{
				name: crossCountryCommonRequirements.typeStarts.name,
				goal: crossCountryCommonRequirements.typeStarts.goal,
				calculate: (stats) =>
					crossCountryCommonRequirements.typeStarts.calculate(stats, commonTypes.prefect)
			},
			crossCountryCommonRequirements.threeGoodLandings,
			crossCountryCommonRequirements.overlandBriefing,
			crossCountryCommonRequirements.DDIPermission,
			crossCountryCommonRequirements.typeEndorsement,
			crossCountryCommonRequirements.rigging,
			{
				// Clubreglement v14.6 §4.3.11: "4 overlandvluchten waarvan minimaal 2 van tenminste 200 kilometer". Counts flights (logbook rows)
				name: '4 overlandvluchten',
				goal: 4,
				calculate: (stats) => {
					return stats.typeXcountryFlights.length;
				}
			},
			{
				name: 'Minimaal 2 overlandvluchten van tenminste 200 kilometer',
				goal: 2,
				calculate: (stats) => longXcountryFlightCount(stats, 200)
			}
		]
	}
];

export default config;
