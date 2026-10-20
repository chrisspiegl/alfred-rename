import process from 'node:process'
import alfy from 'alfy'
import { renamePayload, resultToken } from './apply-rename.js'

const renamedCount = renamePayload(alfy.input)
process.stdout.write(resultToken(renamedCount))
