import path from 'node:path'
import pupa from 'pupa'
import {
  findFilter,
  isFileActionCaseSensitive,
  slugifyLine,
} from './utils.js'

const previewNameSeparator = '\n'

const options = [
  {
    prefix: 'Prefix with Clipboard',
    action: (line, text) => {
      let slug = slugifyLine(text)
      slug = (slug) ? `${slug}-` : ''
      return `${slug}${line}`
    },
  },
  {
    prefix: 'Postfix with Clipboard',
    action: (line, text) => {
      const { name } = path.parse(line) // => "hello"
      const { ext } = path.parse(line) // => ".html"
      let slug = slugifyLine(text)
      slug = (slug) ? `-${slug}` : ''
      return `${name}${slug}${ext}`
    },
  },
  {
    prefix: 'Replace Variable with Clipboard',
    action: (line, text) => pupa(line, { replace: text }),
  },
  {
    prefix: 'Remove Clipboard Content from Filename',
    action: (line, text) => line.replace(text, ''),
  },
]

export function readClipboardText(value) {
  if (typeof value !== 'string') {
    return null
  }

  return value.trim()
}

export function buildRenameItems(filePaths, clipboard) {
  if (!isFileActionCaseSensitive(filePaths)) {
    return [
      {
        title: 'Input must be valid and existing file(s) or folder(s)',
        valid: false,
      },
    ]
  }

  return options.map((option) => {
    const files = filePaths.map((filepath) => {
      const resolvedPath = path.resolve(filepath)
      const filenameBefore = path.basename(resolvedPath)
      const filenameAfter = option.action(filenameBefore, clipboard)
      const filepathBefore = resolvedPath
      const filepathAfter = path.resolve(path.dirname(resolvedPath), filenameAfter)
      return {
        filenameBefore,
        filenameAfter,
        filepathBefore,
        filepathAfter,
      }
    }).filter(element => element.filenameBefore !== element.filenameAfter)

    if (files.length === 0) {
      return false
    }

    return {
      title: `${option.prefix}: ${files[0].filenameAfter}`,
      subtitle: 'Copy to clipboard… Hold CMD Key to actually rename files.',
      match: option.prefix,
      valid: true,
      arg: files.map(element => element.filenameAfter).join(previewNameSeparator),
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
  }).filter(element => Boolean(element))
}

export function scriptFilterItems(rawInput, clipboardValue) {
  const clipboard = readClipboardText(clipboardValue)
  if (clipboard === null) {
    return {
      output: [
        {
          title: 'Clipboard text is missing',
          subtitle: 'Copy text to the clipboard, then try again.',
          valid: false,
        },
      ],
    }
  }

  const query = typeof rawInput === 'string' ? rawInput : ''
  const { inputWithoutFilter, foundFilter } = findFilter(query)
  const filePaths = inputWithoutFilter
    .replaceAll('\t', '\n')
    .split('\n')
    .map(element => element.trim())
  const output = buildRenameItems(filePaths, clipboard)

  if (output.length === 0) {
    return {
      output: [
        {
          title: 'Nothing to process…',
          subtitle: 'Maybe the clipboard is empty?',
        },
      ],
    }
  }

  return {
    filter: foundFilter,
    output,
  }
}
