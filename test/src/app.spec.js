/* global expect, request, describe, it, before, after */
import '../setup'
import { init, buildConfig, setRunner, config } from '../../src/app'

const url = 'http://localhost:8181/api/'

describe('app', () => {

  describe('config', () => {

    it('overrides defaults with passed object', () => {
      const testConfig = {
        lambdas: 'test-override',
        port: 1111,
        apiPath: '/test-override',
        log: false
      }
      buildConfig(testConfig)
      expect(config).to.deep.equal(testConfig)
    })

    it('overvides config with environment variables', () => {
      process.env.GL_LAMBDAS='test-env'
      process.env.GL_PORT='2222'
      process.env.GL_APIPATH='/test-env'
      buildConfig()
      expect(config).to.deep.equal({
        lambdas: 'test-env',
        port: '2222',
        apiPath: '/test-env',
        log: false
      })
    })

    after(() => {
      delete process.env.GL_LAMBDAS
      delete process.env.GL_PORT
      delete process.env.GL_APIPATH
    })

  })

  describe('requests', () => {

    before(() => {
      // Set runner
      setRunner('./build/runner')
      // Start app
      init({
        port: 8181,
        lambdas: './test/lambdas',
        apiPath: '/api',
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