import {renameSync} from 'node:fs';
import alfy from 'alfy';
import {fileExistsWithCaseSync} from './utils.js';

const inputArgs = JSON.parse(alfy.input);

for (const element of inputArgs) {
	if (
		fileExistsWithCaseSync(element.filepathBefore)
    && !fileExistsWithCaseSync(element.filepathAfter)
	) {
		renameSync(element.filepathBefore, element.filepathAfter);
	}
}

