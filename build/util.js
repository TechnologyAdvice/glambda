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

/**
 * Abstracts parsing of routes against template values
 * @param {String} value The value of the template element
 * @param {String} key The property name from the template element
 * @param {String} route The route to check/modify
 */
exports.fileExists = fileExists;
var parseRouteParams = function parseRouteParams(value, key, route) {
  if (value.indexOf('$input.params(\'') >= 0) {
    // Remove wrapper
    var param = value.replace('$input.params(\'', '').replace('\')', '');
    // Replace any occurences with express-param version of template param name
    return route.replace('{' + param + '}', ':' + key);
  }
  return false;
};
exports.parseRouteParams = parseRouteParams;