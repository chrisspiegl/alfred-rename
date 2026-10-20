import fs from 'node:fs';
import path from 'node:path';
import alfy from 'alfy';
import * as csv from 'fast-csv';
import {
	filterOutput,
	findFilter,
	isFileActionCaseSensitive,
} from './src/utils.js';

// Check if this is a transformation request (when CMD+Enter is pressed on an item)
let filesToTransform = null;
try {
	// alfy.input should contain JSON string when CMD+Enter is pressed
	const parsed = JSON.parse(alfy.input);
	// Check if it's an array (multiple files) or a single object
	if (Array.isArray(parsed)) {
		filesToTransform = parsed;
	} else if (typeof parsed === 'object' && parsed.filepathBefore) {
		filesToTransform = [parsed];
	}
} catch (e) {
	// Not a JSON string, treat as regular input - don't log here as it breaks Script Filter JSON
}

(async () => {
	if (filesToTransform && filesToTransform.length > 0) {
		// Handle transformation - this is a Run Script action, not Script Filter
		try {
			console.log(`Starting transformation of ${filesToTransform.length} file(s)`);
			for (const file of filesToTransform) {
				console.log(`Transforming: ${file.filepathBefore} -> ${file.filepathAfter}`);
				await transformCsv(file.filepathBefore, file.filepathAfter, file.detectedDelimiter, file.targetDelimiter);
			}
			console.log(`Successfully transformed ${filesToTransform.length} file(s)`);
			process.exit(0);
		} catch (error) {
			console.error('Error during transformation:', error);
			process.exit(1);
		}
	}

	const {inputWithoutFilter, foundFilter: filter} = findFilter(alfy.input);
	const input = inputWithoutFilter
		.replaceAll('\t', '\n')
		.split('\n')
		.map(element => element.trim());

	// Transformation options - user chooses target delimiter
	const options = [
		{
			prefix: 'Convert to Comma-separated',
			to: ',',
			extension: 'csv',
			action: 'comma',
			mode: 'comma',
		},
		{
			prefix: 'Convert to Semicolon-separated',
			to: ';',
			extension: 'csv',
			action: 'semicolon',
			mode: 'semicolon',
		},
		{
			prefix: 'Convert to Tab-separated',
			to: '\t',
			extension: 'tsv',
			action: 'tab',
			mode: 'tab',
		},
	];

	function detectDelimiter(filePath) {
		const sample = fs.readFileSync(filePath, 'utf8').slice(0, 1024);
		const commaCount = (sample.match(/,/g) || []).length;
		const semicolonCount = (sample.match(/;/g) || []).length;
		const tabCount = (sample.match(/\t/g) || []).length;

		if (tabCount > commaCount && tabCount > semicolonCount) {
			return '\t';
		}
		if (semicolonCount > commaCount) {
			return ';';
		}
		return ',';
	}

	function transformCsv(inputFile, outputFile, fromDelimiter, toDelimiter) {
		return new Promise((resolve, reject) => {
			const data = [];

			fs.createReadStream(inputFile)
				.pipe(csv.parse({ headers: true, delimiter: fromDelimiter }))
				.on('data', row => data.push(row))
				.on('end', () => {
					const ws = fs.createWriteStream(outputFile);
					const csvStream = csv.format({ headers: true, delimiter: toDelimiter });

					csvStream.pipe(ws);

					data.forEach(row => {
						csvStream.write(row);
					});

					csvStream.end();

					ws.on('finish', () => resolve());
					ws.on('error', reject);
				})
				.on('error', reject);
		});
	}

	function run(input) {
		if (!isFileActionCaseSensitive(input)) {
			return [{
				title: 'Input must be valid and existing CSV or TSV file(s)',
				valid: false,
        variables: {
          input: alfy.input
        }
			}];
		}

		return options.map(option => {
			const files = input
				.filter(filepath => {
					const ext = path.extname(filepath).toLowerCase();
					return ext === '.csv' || ext === '.tsv';
				})
				.map(filepath => {
					const detectedDelimiter = detectDelimiter(filepath);
					const filenameBefore = path.basename(filepath, path.extname(filepath));
					const filenameAfter = `${filenameBefore}.${option.action}.${option.extension}`;
					const filepathBefore = path.resolve(filepath);
					const filepathAfter = path.resolve(path.dirname(filepath), filenameAfter);

					return {
						filenameBefore,
						filenameAfter,
						filepathBefore,
						filepathAfter,
						detectedDelimiter,
						targetDelimiter: option.to,
					};
				})
				.filter(element => element.detectedDelimiter !== element.targetDelimiter);

			return files.length > 0 ? {
				title: `${option.prefix}: ${files[0].filenameAfter}`,
				subtitle: `Convert ${files.length} file(s) to ${option.to === '\t' ? 'tab' : option.to} separated.`,
				match: option.prefix,
				valid: true,
				arg: JSON.stringify(files),
				variables: {
					action: 'transform',
				},
			} : false;
		}).filter(element => Boolean(element));
	}


	// Regular Script Filter output (showing options)
	const output = run(input);
	if (output.length > 0) {
		alfy.output(filter ? filterOutput(filter, output) : output);
	} else {
		alfy.output([{
			title: 'No CSV files to transform…',
			subtitle: 'Please provide valid CSV or TSV files as input.',
		}]);
	}
})();
