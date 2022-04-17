import { Patch, PatchHeader } from './interface'

export const parsePatchHeader = (headerLines: string[]): PatchHeader => {
  const patchHeader: PatchHeader = {
    raw: headerLines.join('\n'),
    fromPath: null,
    toPath: null,
    fromRevision: '',
    toRevision: '',
    type: 'addition',
    fromMode: null,
    toMode: null,
    similarity: null,
    dissimilarity: null,
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

export const parse = (patchSource: string) => {
  const patch: Patch = {
    header: {
      raw: '',
      fromPath: null,
      toPath: null,
      fromRevision: '',
      toRevision: '',
      type: 'addition',
      fromMode: null,
      toMode: null,
      similarity: null,
      dissimilarity: null,
    },
    hunks: [],
  }
  const lines = patchSource.split('\n')
  const hunkStartLineNumbers = getHunkStartLineNumbers(lines)

  const patchHeader = parsePatchHeader(
    hunkStartLineNumbers.length === 0 ? lines : lines.slice(0, hunkStartLineNumbers[0])
  )
  patch.header = patchHeader

  return patch
}
