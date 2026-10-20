import assert from 'node:assert/strict'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { test } from 'node:test'
import { scriptFilterItems } from '../src/items.js'

function tempDirectory() {
  return mkdtempSync(path.join(tmpdir(), 'alfred-rename-'))
}

test('joins preview names into one string arg', () => {
  const root = tempDirectory()
  try {
    const firstPath = path.join(root, 'a.txt')
    const secondPath = path.join(root, 'b.txt')
    writeFileSync(firstPath, '')
    writeFileSync(secondPath, '')

    const firstItem = scriptFilterItems(firstPath, 'Hello World').output.find(item => item.match === 'Prefix with Clipboard')
    const secondItem = scriptFilterItems(secondPath, 'Hello World').output.find(item => item.match === 'Prefix with Clipboard')
    const both = scriptFilterItems(`${firstPath}\t${secondPath}`, 'Hello World').output.find(item => item.match === 'Prefix with Clipboard')

    assert.equal(typeof both.arg, 'string')
    assert.equal(both.arg, `${firstItem.arg}\n${secondItem.arg}`)
    assert.equal(both.arg.includes(','), false)

    const renamedFiles = JSON.parse(both.mods.cmd.arg)
    assert.equal(renamedFiles.length, 2)
    assert.equal(renamedFiles[0].filenameAfter, firstItem.arg)
    assert.equal(renamedFiles[1].filenameAfter, secondItem.arg)
  }
  finally {
    rmSync(root, { recursive: true, force: true })
  }
})

test('guards a missing text_to_add value', () => {
  const root = tempDirectory()
  try {
    const filePath = path.join(root, 'a.txt')
    writeFileSync(filePath, '')

    const missing = scriptFilterItems(filePath, undefined)
    assert.equal(missing.output[0].valid, false)
    assert.match(missing.output[0].title, /missing/i)

    const blank = scriptFilterItems(filePath, '   ')
    assert.equal(blank.output[0].title, 'Nothing to process…')
  }
  finally {
    rmSync(root, { recursive: true, force: true })
  }
})
