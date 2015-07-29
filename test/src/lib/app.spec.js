/* global request, describe, it, before */
import '../../setup'
import { app } from '../../../src/lib/app'

const url = 'http://localhost:8181/api/'

describe('app', () => {

  before(() => {
    // Start app
    app({
      port: 8181,
      lambdas: './test/lambdas'
    })
  })

  it('responds with the correct operation', (done) => {
    request(url)
      .get('test')
      .expect(200)
      .end((err, res) => {
        if (err) throw err
        res.body.should.have.property('operation')
        res.body.operation.should.equal('GET')
        done()
      })
  })

  it('responds with correct property value', (done) => {
    request(url)
      .post('test')
      .send({ foo: 'bar' })
      .end((err, res) => {
        if (err) throw err
        res.body.should.have.property('foo')
        res.body.foo.should.equal('bar')
        done()
      })
  })

})