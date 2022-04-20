import { Patch, PatchHeader, HunkHeader, Hunk, ChangeType, NoEndingNewLine } from './interface'
    type: 'modification',
    isBinary: false,
        patchHeader.type = 'modification'
      case 'Binary': {
        patchHeader.isBinary = true
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

      type: 'modification',
      isBinary: false
    fromNoNewline: false,
    toNoNewline: false
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
