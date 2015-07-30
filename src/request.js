const path = require('path')

/**
 * Placeholder for schema object
 */
export let schema = null

/**
 * Loads the schema from specified file
 * @param {String} file The file path of the Gateway schema
 */
export const setSchema = (file) => {
  schema = require(path.resolve(file))
}

