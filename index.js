import process from 'node:process'
import alfy from 'alfy'
import { scriptFilterItems } from './src/items.js'

function filterOutput(filter, output) {
  const filterParts = filter.split(' ')
  for (const filterPart of filterParts) {
    output = alfy.matches(filterPart, output, 'match')
  }

  return output
}

const { filter, output } = scriptFilterItems(alfy.input, process.env.text_to_add)
alfy.output(filter ? filterOutput(filter, output) : output)
