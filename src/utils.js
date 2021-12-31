import alfy from 'alfy';
import {discoverPathSync} from 'discover-path';
import slugify from '@sindresorhus/slugify';

export function isFileActionCaseSensitive(input) {
	const filePaths = input
		.filter(element => Boolean(element.trim()))
		.filter(filepath => {
			if (filepath.slice(0, 1) !== '/') {
				return false;
			}

			return fileExistsWithCaseSync(filepath.trim());
		});
	return filePaths.length > 0;
}

export function fileExistsWithCaseSync(filepath) {
	try {
		return Boolean(discoverPathSync(filepath.trim()));
	} catch {
		return false;
	}
}

export function findFilter(input) {
	const regexFilter = /(!(?<filter>[a-zA-Z ]*))?$/;
	const regexMatches = input.trim().match(regexFilter);
	const foundFilter = regexMatches?.groups.filter;
	const inputWithoutFilter = input.trim().replace(regexFilter, '');
	return {
		inputWithoutFilter,
		foundFilter,
	};
}

export function slugifyLine(output) {
	return slugify(output, {lowercase: false});
}

export function filterOutput(filter, output) {
	const filterSplit = filter.split(' ');
	for (const filter of filterSplit) {
		output = alfy.matches(filter, output, 'match');
	}

	return output;
}
