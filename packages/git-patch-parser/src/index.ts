import { Patch, PatchHeader, HunkHeader, Hunk, ChangeType, NoEndingNewLine } from './interface'

export const parsePatchHeader = (headerLines: string[]): PatchHeader => {
  const patchHeader: PatchHeader = {
    raw: headerLines.join('\n'),
    fromPath: null,
    toPath: null,
    fromRevision: '',
    toRevision: '',
    type: 'modification',
    fromMode: null,
    toMode: null,
    similarity: null,
    dissimilarity: null,
    isBinary: false,
  }

  if (!headerLines[0].startsWith('diff --git')) {
    throw new Error('Invalid patch header')
  }

  const gitDiffHeader = headerLines[0]
  const matches = gitDiffHeader.match(/diff --git a\/(.*) b\/(.*)/)
  if (!matches) {
    throw new Error('Invalid patch header')
  }

  patchHeader.fromPath = matches[1]
  patchHeader.toPath = matches[2]

  /**
   * old mode <mode>
   * new mode <mode>
   * deleted file mode <mode>
   * new file mode <mode>
   * copy from <path>
   * copy to <path>
   * rename from <path>
   * rename to <path>
   * similarity index <number>
   * dissimilarity index <number>
   * index <hash>..<hash> <mode>
   *
   * @see https://git-scm.com/docs/git-diff#_generating_patch_text_with_p
   */
  for (let i = 1, len = headerLines.length; i < len; i += 1) {
    const line = headerLines[i]
    const words = line.split(' ')
    const action = words[0]

    switch (action) {
      case 'old': {
        const fromMode = words[2]
        const toMode = headerLines[i + 1].split(' ')[2]
        patchHeader.fromMode = parseInt(fromMode, 10)
        patchHeader.toMode = parseInt(toMode, 10)
        patchHeader.type = 'modification'
        i += 1
        break
      }
      case 'new': {
        patchHeader.type = 'addition'
        patchHeader.fromMode = null
        patchHeader.toMode = parseInt(words[3], 10)
        patchHeader.fromPath = null
        break
      }
      case 'deleted': {
        patchHeader.type = 'deletion'
        patchHeader.fromMode = parseInt(words[3], 10)
        patchHeader.toMode = null
        patchHeader.toPath = null
        break
      }
      case 'copy': {
        patchHeader.type = 'copy'
        i += 1
        break
      }
      case 'rename': {
        patchHeader.type = 'renaming'
        patchHeader.fromPath = words[2]
        patchHeader.toPath = headerLines[i + 1].split(' ')[2]
        i += 1
        break
      }
      case 'similarity': {
        patchHeader.similarity = parseInt(words[2], 10)
        break
      }
      case 'dissimilarity': {
        patchHeader.type = 'modification'
        patchHeader.dissimilarity = parseInt(words[2], 10)
        break
      }
      case 'index': {
        const [fromRevision, toRevision] = words[1].split('..')
        patchHeader.fromRevision = fromRevision
        patchHeader.toRevision = toRevision
        if (words[2]) {
          patchHeader.fromMode = parseInt(words[2], 10)
          patchHeader.toMode = parseInt(words[2], 10)
        }

        break
      }
      case 'Binary': {
        patchHeader.isBinary = true
      }
    }
  }

  return patchHeader
}

const getHunkStartLineNumbers = (lines: string[]) => {
  const hunkLineNumbers: number[] = []

  for (let i = 0, len = lines.length; i < len; i += 1) {
    const line = lines[i]

    if (line.startsWith('@@')) {
      hunkLineNumbers.push(i)
    }
  }

  return hunkLineNumbers
}

export const parseHunkHeader = (hunkHeaderLine: string): HunkHeader => {
  const hunkHeader: HunkHeader = {
    raw: hunkHeaderLine,
    fromLineStart: 0,
    fromLineCount: 0,
    toLineStart: 0,
    toLineCount: 0,
    funcname: ''
  }

  /**
   * If a hunk contains just one line, only its start line number appears.
   * Otherwise its line numbers look like ‘start,count’.
   * An empty hunk is considered to start at the line that follows the hunk.
   *
   * More detail see:
   * @see https://www.gnu.org/software/diffutils/manual/diffutils.html#Detailed-Description-of-Unified-Format
   */
  const matches = hunkHeaderLine.match(/@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@( .*)?/)
  if (!matches) {
    throw new Error('Invalid hunk header')
  }

  hunkHeader.fromLineStart = parseInt(matches[1], 10)
  hunkHeader.fromLineCount = matches[2] ? parseInt(matches[2], 10) : 1
  hunkHeader.toLineStart = parseInt(matches[3], 10)
  hunkHeader.toLineCount = matches[4] ? parseInt(matches[4], 10) : 1
  hunkHeader.funcname = matches[5] ? matches[5].trim() : ''

  return hunkHeader
}

export const parseHunk = (hunkLines: string[]): [Hunk, NoEndingNewLine] => {

  const hunkHeaderLine = hunkLines[0]
  const hunkHeader = parseHunkHeader(hunkHeaderLine)

  const hunk: Hunk = {
    header: hunkHeader,
    fromLines: [],
    toLines: []
  }

  let fromLineIndex = hunkHeader.fromLineStart
  let toLineIndex = hunkHeader.toLineStart

  let endingNewLine: NoEndingNewLine = 0
  let prevType: NoEndingNewLine = 0

  for (let i = 1, len = hunkLines.length; i < len; i += 1) {
    const line = hunkLines[i]

    if (line.startsWith('-')) {
      prevType = 1
      hunk.fromLines.push({
        content: line.slice(1),
        lineNumber: fromLineIndex,
        type: 'deleted'
      })
      fromLineIndex += 1
    } else if (line.startsWith('+')) {
      prevType = 2
      hunk.toLines.push({
        content: line.slice(1),
        lineNumber: toLineIndex,
        type: 'added'
      })
      toLineIndex += 1
    } else if (line.startsWith(' ')) {
      prevType = 3
      hunk.fromLines.push({
        content: line.slice(1),
        lineNumber: fromLineIndex,
        type: 'common'
      })
      hunk.toLines.push({
        content: line.slice(1),
        lineNumber: toLineIndex,
        type: 'common'
      })
      fromLineIndex += 1
      toLineIndex += 1
    }
    else if (line.startsWith('\\')) {
      endingNewLine = prevType
    }
  }

  return [hunk, endingNewLine]
}

export const parse = (patchSource: string) => {
  const patch: Patch = {
    header: {
      raw: '',
      fromPath: null,
      toPath: null,
      fromRevision: '',
      toRevision: '',
      type: 'modification',
      fromMode: null,
      toMode: null,
      similarity: null,
      dissimilarity: null,
      isBinary: false
    },
    hunks: [],
    fromNoNewline: false,
    toNoNewline: false
  }
  const lines = patchSource.split('\n')
  const hunkStartLineNumbers = getHunkStartLineNumbers(lines)

  const patchHeader = parsePatchHeader(
    hunkStartLineNumbers.length === 0 ? lines : lines.slice(0, hunkStartLineNumbers[0])
  )
  patch.header = patchHeader

  for (let i = 0, len = hunkStartLineNumbers.length; i < len; i += 1) {
    const hunkStartLineNumber = hunkStartLineNumbers[i]
    const hunkEndLineNumber = i === len - 1 ? lines.length : hunkStartLineNumbers[i + 1]
    const hunkLines = lines.slice(hunkStartLineNumber, hunkEndLineNumber)
    const [hunk, nenl] = parseHunk(hunkLines)
    patch.hunks.push(hunk)

    if (nenl) {
      patch.fromNoNewline = Boolean(0b01 & nenl)
      patch.toNoNewline = Boolean(0b10 & nenl)
    }
  }

  return patch
}
