import process from 'node:process';
import path from 'node:path';
import alfy from 'alfy';
import pupa from 'pupa';
import {findFilter, isFileAction, slugifyLine} from './src/utils.js';

const {inputWithoutFilter, foundFilter: filter} = findFilter(alfy.input);
const input = inputWithoutFilter.replaceAll('\t', '\n');
const clipboard = process.env.text_to_add.trim();

const options = [
	{
		prefix: 'Prefix with Clipboard',
		action: (line, text) => {
			let slug = slugifyLine(text);
			slug = (slug) ? slug + '-' : '';
			return `${slug}${line}`;
		},
	},
	{
		prefix: 'Postfix with Clipboard',
		action: (line, text) => {
			const {name} = path.parse(line); //=> "hello"
			const {ext} = path.parse(line); //=> ".html"
			let slug = slugifyLine(text);
			slug = (slug) ? '-' + slug : '';
			return `${name}${slug}${ext}`;
		},
	},
	{
		prefix: 'Replace Variable with Clipboard',
		action: (line, text) => pupa(line, {replace: text}),
	},
	{
		prefix: 'Remove Clipboard Content from Filename',
		action: (line, text) => line.replace(text, ''),
	},
];

function run(input) {
	if (isFileAction(input)) {
		return options.map(option => {
			const files = input.split('\n').map(filepath => {
				filepath = path.resolve(filepath);
				const filenameBefore = path.basename(filepath);
				const filenameAfter = option.action(filenameBefore, clipboard);
				const filepathBefore = filepath;
				const filepathAfter = path.resolve(path.dirname(filepath), filenameAfter);
				return {
					filenameBefore,
					filenameAfter,
					filepathBefore,
					filepathAfter,
				};
			}).filter(element => element.filenameBefore !== element.filenameAfter);
			return files.length > 0
				? {
					title: `${option.prefix}: ${files[0].filenameAfter}`,
					subtitle: 'Copy to clipboard… Hold CMD Key to actually rename files.',
					match: option.prefix,
					valid: true,
					arg: files.map(element => element.filenameAfter),

					variables: {
						action: 'copy',
					},
					mods: {
						cmd: {
							subtitle: 'Actually rename files!',
							arg: JSON.stringify(files),
							variables: {
								action: 'rename',
							},
						},
					},
				}
				: false;
		}).filter(element => Boolean(element));
	}

	return [
		{
			title: 'Input must be valid and existing file(s) or folder(s)',
			valid: false,
		},
	];
}

function filterOutput(filter, output) {
	const filterSplit = filter.split(' ');
	for (const filter of filterSplit) {
		output = alfy.matches(filter, output, 'match');
	}

	return output;
}

const output = run(input);
if (output.length > 0) {
	alfy.output(filter ? filterOutput(filter, output) : output);
} else {
	alfy.output([{
		title: 'Nothing to process…',
		subtitle: 'Maybe the clipboard is empty?',
	}]);
}
