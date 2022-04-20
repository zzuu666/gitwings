import * as fs from 'fs'
import * as path from 'path'
import { parse } from '../src'

test('Test Git patch parser', () => {
  const fixtures = fs.readdirSync(path.join(__dirname, 'fixtures'))

  for (let i = 0, len = fixtures.length; i < len; i += 1) {
    const fixture = fixtures[i]
    const matches = fixture.match(/^(.*)\.patch$/)
    if (matches) {
      const name = matches[1]
      const source = fs.readFileSync(path.join(__dirname, 'fixtures', fixture), 'utf8')
      const expected = fs.readFileSync(path.join(__dirname, 'outputs', name + '.json'), 'utf8')
      const actual = JSON.stringify(parse(source), null, 2)
      expect(actual).toEqual(expected)
    }
  }
})
