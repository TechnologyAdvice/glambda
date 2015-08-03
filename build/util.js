'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
var Promise = require('bluebird');
var path = require('path');
var fs = Promise.promisifyAll(require('fs'));

/**
 * Checks if file exists
 * @param {String} file Path to file
 * @returns {Object} Promise
 */
var fileExists = function fileExists(file) {
  return fs.openAsync(path.resolve(file), 'r');
};
exports.fileExists = fileExists;