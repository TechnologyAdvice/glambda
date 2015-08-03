/* global expect, request, describe, it, before, after */
import '../setup'
import { fileExists, parseRouteParams, parseBodyParams } from '../../src/util'

describe('util', () => {

  describe('fileExists', () => {
    it('rejects when the file does not exist', (done) => {
      fileExists('./test/dne.txt').catch(() => done())
    })

    it('resolves when the file exists', (done) => {
      fileExists('./test/gateway.yml').then(() => done())
    })
  })

  describe('parseRouteParams', () => {
    it('returns a properly formatted route', () => {
      const testCase = parseRouteParams(`$input.params('fooId')`, 'id', '/foo/{fooId}')
      expect(testCase).to.equal('/foo/:id')
    })
  })

  describe('parseBodyParams', () => {

    const testBody = {
      foo: 'bar'
    }

    it('returns the full body when input.json($) is requested', () => {
      const testCase = parseBodyParams(`$input.json('$')`, testBody)
      expect(testCase).to.deep.equal(testBody)
    })

    it('returns the specific property when input.json($.PROP) is requested', () => {
      const testCase = parseBodyParams(`$input.json('$.foo')`, testBody)
      expect(testCase).to.equal(testBody.foo)
    })
    
    it('returns the value if no parameters matched', () => {
      const testCase = parseBodyParams('fizz', testBody)
      expect(testCase).to.equal('fizz')
    })
  })

})