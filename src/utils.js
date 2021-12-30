import {discoverPathSync} from 'discover-path';
import slugify from '@sindresorhus/slugify';

export function isFileAction(input) {
	const lines = input.split('\n').filter(element => element.trim() !== '');
	const filePathLines = lines
		.map(line => {
			if (input.slice(0, 1) !== '/') {
				return false;
			}

			return fileExistsWithCaseSync(line.trim());
		})
		.filter(element => element);
	return filePathLines.length > 0;
}

export function findFilter(input) {
	const regexFilter = /!(?<filter>[a-zA-Z ]*)$/;
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

export function fileExistsWithCaseSync(filepath) {
	try {
		return Boolean(discoverPathSync(filepath.trim()));
	} catch {
		return false;
	}
}
