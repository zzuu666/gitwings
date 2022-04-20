import { parse, parseHunkHeader } from '../src/index'

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

  test('Should throw error when hunk header illegal', () => {
    expect(() => {
      parseHunkHeader('@@ error, illegal @@')
    }).toThrow()
  })

})
