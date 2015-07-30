/* global expect, request, describe, it, before, after */
import '../setup'
import { schema, loadSchema } from '../../src/request'

const schemaPath = './test/gateway.yml'

describe('request', () => {

  describe('setSchema', () => {

    it('sets the schema object based on the file passed', () => {
      loadSchema(schemaPath)
      expect(schema).to.be.an.object
    })

  })

})