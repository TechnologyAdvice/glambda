/* global expect, request, describe, it, before */
import '../../setup'
import { app, buildConfig, config } from '../../../src/lib/app'

const url = 'http://localhost:8181/api/'

describe('app', () => {

  describe('config', () => {

    it('properly overrides defaults with passed object', () => {
      const testConfig = {
        lambdas: 'test-override',
        port: 1111,
        log: false
      }
      buildConfig(testConfig)
      expect(config).to.deep.equal(testConfig)
    })

    it('properly overvides config with environment variables', () => {
      process.env.GL_LAMBDAS='test-env'
      process.env.GL_PORT='2222'
      buildConfig()
      expect(config).to.deep.equal({
        lambdas: 'test-env',
        port: '2222',
        log: false
      })
    })

  })

  describe('requests', () => {

    before(() => {
      delete process.env.GL_LAMBDAS
      delete process.env.GL_PORT
      // Start app
      app({
        port: 8181,
        lambdas: './test/lambdas',
        log: false
      })
    })

    it('responds with the correct operation', (done) => {
      request(url)
        .get('test')
        .expect(200)
        .end((err, res) => {
          if (err) {
            done(err)
            return
          }
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
          if (err) {
            done(err)
            return
          }
          res.body.should.have.property('foo')
          res.body.foo.should.equal('bar')
          done()
        })
    })

  })

})