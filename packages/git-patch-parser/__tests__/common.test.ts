import * as fs from 'fs'
import * as path from 'path'
import { parse } from '../src/index'

describe('Test Git patch parser common function', () => {
  test('Should throw error when missing git diff header', () => {
    expect(() => {
      parse('')
    }).toThrow()
  })

  test('Should throw error when git diff header illegal', () => {
    expect(() => {
      parse('diff --git a b')
    }).toThrow()
  })

  test('Should parse git diff header correctly.', () => {
    const patch = fs.readFileSync(path.join(__dirname, 'fixtures/newFile.patch'), 'utf8')
    const { header } = parse(patch)
    const { fromPath, toPath, fromRevision, toRevision, fromMode, toMode, type } = header

    expect(fromPath).toBe(null)
    expect(toPath).toBe('packages/zue-reactive/src/batch.ts')
    expect(fromRevision).toBe('0000000')
    expect(toRevision).toBe('e9c0588')
    expect(fromMode).toBe(null)
    expect(toMode).toBe(100644)
    expect(type).toBe('addition')
  })

  test('Should parse git diff header correctly when add a empty file', () => {
    const patch = fs.readFileSync(path.join(__dirname, 'fixtures/newEmptyFile.patch'), 'utf8')
    const { header } = parse(patch)
    const { fromPath, toPath } = header

    expect(fromPath).toBe(null)
    expect(toPath).toBe('a.txt')
  })


  test('Should parse git diff header correctly when rename file', () => {
    const patch = fs.readFileSync(path.join(__dirname, 'fixtures/renameNModify.patch'), 'utf8')
    const { header } = parse(patch)
    const { fromPath, toPath, fromRevision, toRevision, fromMode, toMode, type, similarity } = header

    expect(fromPath).toBe('package.json')
    expect(toPath).toBe('packages.json')
    expect(fromRevision).toBe('4485ec5')
    expect(toRevision).toBe('d2ae972')
    expect(fromMode).toBe(100644)
    expect(toMode).toBe(100644)
    expect(type).toBe('renaming')
    expect(similarity).toBe(84)
  })

  test('Should parse git diff header correctly when modify file mod', () => {
    const patch = fs.readFileSync(path.join(__dirname, 'fixtures/modifyNMod.patch'), 'utf8')
    const { header } = parse(patch)
    const { fromPath, toPath, fromRevision, toRevision, fromMode, toMode, type } = header

    expect(fromPath).toBe('package.json')
    expect(toPath).toBe('package.json')
    expect(fromRevision).toBe('4485ec5')
    expect(toRevision).toBe('8ffd444')
    expect(fromMode).toBe(100644)
    expect(toMode).toBe(100755)
    expect(type).toBe('modification')
  })

  test('Should parse git diff header correctly when delete file', () => {
    const patch = fs.readFileSync(path.join(__dirname, 'fixtures/delete.patch'), 'utf8')
    const { header } = parse(patch)
    const { fromPath, toPath, fromRevision, toRevision, fromMode, toMode, type } = header

    expect(fromPath).toBe('package.json')
    expect(toPath).toBe(null)
    expect(fromRevision).toBe('4485ec5')
    expect(toRevision).toBe('0000000')
    expect(fromMode).toBe(100644)
    expect(toMode).toBe(null)
    expect(type).toBe('deletion')
  })
})
