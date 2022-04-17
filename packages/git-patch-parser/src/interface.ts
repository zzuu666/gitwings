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
}

export interface Hunk {
  header: HunkHeader
  changes: Change[]
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
}

export interface Patch {
  header: PatchHeader
  hunks: Hunk[]
}
