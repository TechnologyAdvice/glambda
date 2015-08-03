const Promise = require('bluebird')
const path = require('path')
const fs = Promise.promisifyAll(require('fs'))

/**
 * Checks if file exists
 * @param {String} file Path to file
 * @returns {Object} Promise
 */
export const fileExists = (file) => {
  return fs.openAsync(path.resolve(file), 'r')
}