/* global expect, request, describe, it, before, after */
import '../setup'
import { fileExists, parseRouteParams } from '../../src/util'

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
      let testCase = parseRouteParams(`$input.params('fooId')`, 'id', '/foo/{fooId}')
      expect(testCase).to.equal('/foo/:id')
    })
  })

})