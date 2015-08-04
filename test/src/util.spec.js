/* global expect, request, describe, it, before, after */
import '../setup'
import { fileExists, parseRouteParams, parseRequestParams } from '../../src/util'

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

    it('returns false if param is not in route', () => {
      const testCase = parseRouteParams(`$input.params('notInRoute')`, 'id', '/foo/{fooId}')
      expect(testCase).to.be.false
    })
  })

  describe('parseRequestParams', () => {

    const testBody = {
      body: {
        foo: 'bar'
      }
    }

    const testQuery = {
      query: {
        baz: 'quz'
      }
    }

    it('returns the full body when input.json($) is requested', () => {
      const testCase = parseRequestParams(`$input.json('$')`, testBody)
      expect(testCase).to.deep.equal(testBody.body)
    })

    it('returns the specific body property when input.json($.PROP) is requested', () => {
      const testCase = parseRequestParams(`$input.json('$.foo')`, testBody)
      expect(testCase).to.equal(testBody.body.foo)
    })

    it('returns the querystring value when input.params(PROP) is requested', () => {
      const testCase = parseRequestParams(`$input.params('baz')`, testQuery)
      expect(testCase).to.equal('quz')
    })

    it('returns the value if no parameters matched', () => {
      const testCase = parseRequestParams('fizz', testBody)
      expect(testCase).to.equal('fizz')
    })
  })

})