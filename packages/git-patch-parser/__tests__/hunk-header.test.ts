import { parse, parseHunkHeader } from '../src/index'

describe('Test Git patch hunk header parser', () => {
  test('Should throw error when hunk header illegal', () => {
    const header = parseHunkHeader('@@ -1,10 +1,20 @@')

    expect(header).toEqual({
      raw: '@@ -1,10 +1,20 @@',
      fromLineStart: 1,
      fromLineCount: 10,
      toLineStart: 1,
      toLineCount: 20,
      funcname: '',
    })
  })


  test('Should throw error when hunk header illegal', () => {
    const header = parseHunkHeader('@@ -1 +1 @@')

    expect(header).toEqual({
      raw: '@@ -1 +1 @@',
      fromLineStart: 1,
      fromLineCount: 1,
      toLineStart: 1,
      toLineCount: 1,
      funcname: '',
    })
  })

  test('Should throw error when hunk header illegal', () => {
    const header = parseHunkHeader('@@ -1 +1 @@ export default App')

    expect(header).toEqual({
      raw: '@@ -1 +1 @@ export default App',
      fromLineStart: 1,
      fromLineCount: 1,
      toLineStart: 1,
      toLineCount: 1,
      funcname: 'export default App',
    })
  })
})
