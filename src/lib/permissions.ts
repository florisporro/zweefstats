export interface Requirement {
	name: string;
	goal?: number;
	calculate?: (stats: Stats) => number;
}

export interface Permission {
	name: string;
	requirements: Requirement[];
}

import acvz from './permissions/acvz';

const clubs: { [key: string]: Permission[] } = { acvz };

export default clubs;
