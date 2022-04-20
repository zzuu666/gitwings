/**
 * - 0: not find NENL(no ending new line) mark
 * - 1: find NENL mark in from line
 * - 2: find NENL mark in to line
 * - 3: find NENL mark in both from and to line
 */
export type NoEndingNewLine = 0 | 1 | 2 | 3

export type ChangeType = 'added' | 'deleted' | 'common'

export interface Change {
  type: ChangeType;
  content: string
  lineNumber: number
}


/**
 * https://www.gnu.org/software/diffutils/manual/diffutils.html#Comparison
 */
export interface HunkHeader {
  raw: string
  fromLineStart: number
  fromLineCount: number
  toLineStart: number
  toLineCount: number
  /** https://git-scm.com/docs/gitattributes#_defining_a_custom_hunk_header */
  funcname: string
}

export interface Hunk {
  header: HunkHeader
  fromLines: Change[]
  toLines: Change[]
}

export type PatchType = 'addition' | 'copy' | 'deletion' | 'modification' | 'renaming'

export interface PatchHeader {
  raw: string
  /** `null` if add a file */
  fromPath: string | null
  /** `null` if delete a file */
  toPath: string | null
  fromRevision: string
  toRevision: string
  type: PatchType
  fromMode: number | null
  toMode: number | null
  similarity: number | null
  dissimilarity: number | null
  isBinary: boolean
}

export interface Patch {
  header: PatchHeader
  hunks: Hunk[]
  fromNoNewline: boolean
  toNoNewline: boolean
}
