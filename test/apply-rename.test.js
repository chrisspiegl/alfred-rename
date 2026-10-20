import assert from 'node:assert/strict'
import { existsSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { test } from 'node:test'
import {
  applyRename,
  renamedResult,
  renamePayload,
  resultToken,
  skippedResult,
} from '../src/apply-rename.js'

function tempDirectory() {
  return mkdtempSync(path.join(tmpdir(), 'alfred-rename-'))
}

test('renames a file when the destination is free', () => {
  const root = tempDirectory()
  try {
    const filepathBefore = path.join(root, 'a.txt')
    const filepathAfter = path.join(root, 'b.txt')
    writeFileSync(filepathBefore, 'hello')

    const renamedCount = applyRename([{ filepathBefore, filepathAfter }])

    assert.equal(renamedCount, 1)
    assert.equal(resultToken(renamedCount), renamedResult)
    assert.equal(existsSync(filepathBefore), false)
    assert.equal(existsSync(filepathAfter), true)
  }
  finally {
    rmSync(root, { recursive: true, force: true })
  }
})

test('skips the success result when renameSync did not run', () => {
  const root = tempDirectory()
  try {
    const filepathBefore = path.join(root, 'a.txt')
    const filepathAfter = path.join(root, 'b.txt')
    writeFileSync(filepathBefore, 'hello')
    writeFileSync(filepathAfter, 'already')

    const renamedCount = applyRename([{ filepathBefore, filepathAfter }])

    assert.equal(renamedCount, 0)
    assert.equal(resultToken(renamedCount), skippedResult)
    assert.equal(existsSync(filepathBefore), true)
    assert.equal(existsSync(path.join(root, 'a.txt')), true)
  }
  finally {
    rmSync(root, { recursive: true, force: true })
  }
})

test('skips a missing source file', () => {
  const root = tempDirectory()
  try {
    const filepathBefore = path.join(root, 'missing.txt')
    const filepathAfter = path.join(root, 'b.txt')

    const renamedCount = applyRename([{ filepathBefore, filepathAfter }])

    assert.equal(renamedCount, 0)
    assert.equal(existsSync(filepathAfter), false)
  }
  finally {
    rmSync(root, { recursive: true, force: true })
  }
})

test('a payload that cannot be renamed does not report success', () => {
  assert.equal(renamePayload('not-json'), 0)
  assert.equal(renamePayload('{"filepathBefore":"a"}'), 0)
  assert.equal(resultToken(renamePayload(undefined)), skippedResult)
})
