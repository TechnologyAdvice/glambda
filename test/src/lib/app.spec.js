/* global sinon, expect, describe, it, before */
import '../../setup'
import { app } from '../../../src/lib/app'

const request = require('supertest')

const url = 'http://localhost/api/'

describe('app', () => {

  before(() => {
    // Start app
    app({
      port: 7777,
      lambdas: './test/lambdas'
    })
  })

  describe('get', (done) => {
    it('responds with the operation', () => {
      request(url)
        .get('test')
        .expect(200)
        .end((err, res) => {
          if (err) {
            throw err
          }
          res.body.should.have.property('operation')
          res.body.operation.should.equal('GET')
          done()
        })
    })
  })

})