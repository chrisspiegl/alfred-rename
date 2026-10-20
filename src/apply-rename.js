import { renameSync as renameFileSync } from 'node:fs'
import { fileExistsWithCaseSync } from './utils.js'

export const renamedResult = 'renamed'
export const skippedResult = 'skipped'

export function resultToken(renamedCount) {
  return renamedCount > 0 ? renamedResult : skippedResult
}

export function parseRenameFiles(raw) {
  try {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) {
      return []
    }

    return parsed
  }
  catch {
    return []
  }
}

export function applyRename(files, {
  renameSync = renameFileSync,
  exists = fileExistsWithCaseSync,
} = {}) {
  let renamedCount = 0
  for (const element of files) {
    if (!element || typeof element.filepathBefore !== 'string' || typeof element.filepathAfter !== 'string') {
      continue
    }

    if (exists(element.filepathBefore) && !exists(element.filepathAfter)) {
      renameSync(element.filepathBefore, element.filepathAfter)
      renamedCount += 1
    }
  }

  return renamedCount
}

export function renamePayload(raw, options) {
  return applyRename(parseRenameFiles(raw), options)
}
