/* global expect, request, describe, it, before, after */
import '../setup'
import { schema, setSchema } from '../../src/request'

const schemaPath = './test/gateway.json'

describe('request', () => {

  describe('setSchema', () => {

    it('sets the schema object based on the file passed', () => {
      setSchema(schemaPath)
      expect(schema).to.be.an.object
    })

  })

})