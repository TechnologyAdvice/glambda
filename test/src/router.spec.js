/* global expect, request, describe, it, before, after */
import '../setup'
import { schema, loadSchema } from '../../src/router'

const schemaPath = './test/gateway.yml'

describe('router', () => {

  describe('setSchema', () => {

    it('sets the schema object based on the file passed', () => {
      loadSchema(schemaPath)
      expect(schema).to.be.an.object
    })

  })

})