/* global expect, request, describe, it, before, after */
import '../setup'
import { schema, loadSchema, walkSchema, routes, mapTemplateParams } from '../../src/router'

const schemaPath = './test/gateway.yml'

describe('router', () => {

  describe('setSchema', () => {

    it('sets the schema object based on the file passed', () => {
      loadSchema(schemaPath)
      expect(schema).to.be.an.object
      walkSchema()
    })

  })

  describe('walkSchema', () => {

    it('creates array of route objects from the schema', () => {
      walkSchema()
      expect(routes).to.be.an.array
      expect(routes[0]).to.be.an.object
    })

  })

  describe('mapTemplateParams', () => {

    it('identifies template params and replaces route param names', () => {
      let route = '/foo/{fooId}'
      let template = { id: '$input.params(\'fooId\')', test: 'foo' }
      let output = mapTemplateParams(route, template)
      expect(output).to.deep.equal({ route: '/foo/:id', template: { test: 'foo' } })
    })

  })

})