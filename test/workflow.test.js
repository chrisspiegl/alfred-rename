import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import packageJson from '../package.json' with { type: 'json' }
import { renamedResult } from '../src/apply-rename.js'

const plist = readFileSync(new URL('../info.plist', import.meta.url), 'utf8')
const runScriptUid = '910B18BA-B114-4274-8324-C365EEBFC2D0'
const notificationUid = '96D583BD-F244-4660-BD07-8F6BEF4ED277'
const renameGateUid = '4F8C2A91-6B37-4E05-9D14-A2C7E5B083F6'
const renamedOutputUid = '8D1E6B40-C5A2-4F79-B318-7E0A9C4D52B1'

test('plist metadata matches this workflow', () => {
  assert.match(plist, new RegExp(`<key>version</key>\\s*<string>${packageJson.version}</string>`))
  assert.match(plist, /<key>description<\/key>\s*<string>Alfred workflow to rename files and folders via your clipboard<\/string>/)
  assert.match(plist, /<key>webaddress<\/key>\s*<string>https:\/\/github\.com\/chrisspiegl\/alfred-rename<\/string>/)
  assert.match(plist, /rename files and folders via your clipboard/)
  assert.equal(plist.includes('Slugified their names!'), false)
  assert.match(plist, /<key>text<\/key>\s*<string>The selected files were renamed\.<\/string>/)
})

test('the success notification is gated on a completed rename', () => {
  const connections = plist.slice(
    plist.indexOf('<key>connections</key>'),
    plist.indexOf('<key>createdby</key>'),
  )
  const scriptKey = `<key>${runScriptUid}</key>`
  const scriptStart = connections.indexOf(scriptKey)
  const scriptBlock = connections.slice(scriptStart, connections.indexOf('</array>', scriptStart))

  assert.equal(scriptBlock.includes(notificationUid), false)
  assert.match(scriptBlock, new RegExp(renameGateUid))
  assert.match(plist, new RegExp(`<key>matchstring</key>\\s*<string>${renamedResult}</string>`))
  assert.match(
    connections,
    new RegExp(`<key>destinationuid</key>\\s*<string>${notificationUid}</string>[\\s\\S]*?<key>sourceoutputuid</key>\\s*<string>${renamedOutputUid}</string>`),
  )
  assert.match(plist, /<key>concurrently<\/key>\s*<false\/>/)
  assert.equal(plist.includes('./node_modules/.bin/run-node index.js'), true)
  assert.equal(plist.includes('./node_modules/.bin/run-node src/rename.js'), true)
  assert.equal(plist.includes('/usr/local/bin/node'), false)
})
