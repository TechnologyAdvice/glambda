/*
 * Copyright (c) 2015 TechnologyAdvice
 */

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
 * @param {String} key The property name of the template element
 * @param {String} route The route to check/modify
 */
exports.fileExists = fileExists;
var parseRouteParams = function parseRouteParams(value, key, route) {
  if (value.indexOf('$input.params(\'') >= 0) {
    // Remove wrapper
    var param = value.replace('$input.params(\'', '').replace('\')', '');
    // Ensure route contains match, replace
    if (route.indexOf('{' + param + '}') >= 0) return route.replace('{' + param + '}', ':' + key);
    // Not matched
    return false;
  }
  return false;
};

/**
 * Abstracts parsing of body against template values
 * @param {String} value The value of the template element
 * @param {Object} body The request body
 * @returns {String} The value of the body property requested by the template
 */
exports.parseRouteParams = parseRouteParams;
var parseRequestParams = function parseRequestParams(value, req) {
  // Body
  if (value.indexOf('$input.json(\'$') >= 0) {
    // Get the name to check
    var _name = value.replace('$input.json(\'$', '').replace('\')', '');
    // Return the entire body
    if (!_name.length) return req.body;
    // Return the specific property of the body (or null if DNE)
    _name = _name.replace(/^\./, ''); // Remove leading dot
    return req.body && req.body[_name] ? req.body[_name] : null;
  }
  // Param (querystring or header)
  if (value.indexOf('$input.params(\'') >= 0) {
    // Remove wrapper
    var param = value.replace('$input.params(\'', '').replace('\')', '');
    // Return if matching querysting
    if (req.query && req.query[param]) return req.query[param];
    // Retrun if matching header (or undefined)
    return req.get(param);
  }
  // Custom value passed through
  return value;
};
exports.parseRequestParams = parseRequestParams;