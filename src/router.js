const path = require('path')
const yaml = require('yamljs')

/**
 * Placeholder for schema object
 */
export let schema = null

/**
 * Loads the schema from specified file
 * @param {String} file The file path of the Gateway schema
 */
export const loadSchema = (file) => {
  schema = yaml.load(path.resolve(file))
}

