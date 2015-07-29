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

  describe('request', (done) => {
    it('responds with the correct operation', () => {
      request(url)
        .get('test')
        .expect(200)
        .end((err, res) => {
          if (err) {
            throw err
          }
          res.body.should.have.property('operation')
          res.body.operation.should.equal('GET')
        })
    })
  })

  describe('withPayload', (done) => {
    it('responds with correct property value', () => {
      request(url)
        .post('test')
        .send({ foo: 'bar' })
        .expect(200)
        .end((err, res) => {
          if (err) {
            throw err
          }
          res.body.should.have.property('foo')
          res.body.foo.should.equal('bar')
        })
    })
  })

})