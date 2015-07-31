/* global expect, request, describe, it, before, after */
import '../setup'
import { init, config, buildConfig, setRunner, parseBody } from '../../src/app'

const url = 'http://localhost:8181/api/'

describe('app', () => {

  describe('config', () => {

    it('overrides defaults with passed object', () => {
      const testConfig = {
        lambdas: 'test-override',
        schema: 'gateway-override',
        port: 1111,
        apiPath: '/test-override',
        log: false
      }
      buildConfig(testConfig)
      expect(config).to.deep.equal(testConfig)
    })

    it('overvides config with environment variables', () => {
      process.env.GL_LAMBDAS='test-env'
      process.env.GL_SCHEMA='gateway-env'
      process.env.GL_PORT='2222'
      process.env.GL_APIPATH='/test-env'
      buildConfig()
      expect(config).to.deep.equal({
        lambdas: 'test-env',
        schema: 'gateway-env',
        port: '2222',
        apiPath: '/test-env',
        log: false
      })
    })

    after(() => {
      delete process.env.GL_LAMBDAS
      delete process.env.GL_SCHEMA
      delete process.env.GL_PORT
      delete process.env.GL_APIPATH
    })

  })
  
  describe('parseBody', () => {
    
    it('combines custom params and req.body to create event object', () => {
      const reqBody = { foo: 'bar' }
      const template = { baz: 'quz', body: `$input.json('$')` }
      const event = parseBody(reqBody, template)
      const shouldBe = { baz: 'quz', body: { foo: 'bar' } } 
      expect(event).to.deep.equal(shouldBe)
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
        schema: './test/gateway.yml',
        apiPath: '/api',
        log: false
      })
    })

    it('responds with the correct method param', (done) => {
      request(url)
        .get('foo/someId')
        .expect(200)
        .end((err, res) => {
          if (err) {
            done(err)
            return
          }
          res.body.should.have.property('method')
          res.body.method.should.equal('get')
          done()
        })
    })

    it('responds with correct property values', (done) => {
      request(url)
        .put('foo/someId')
        .send({ foo: 'bar' })
        .end((err, res) => {
          if (err) {
            done(err)
            return
          }
          let responseText = res.body
          // Custom pass-through
          responseText.should.have.property('baz')
          responseText.baz.should.equal('quz')
          // Body pass-through
          responseText.should.have.property('body')
          responseText.body.should.have.property('foo')
          responseText.body.foo.should.equal('bar')
          done()
        })
    })

  })

})