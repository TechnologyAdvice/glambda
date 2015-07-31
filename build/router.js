'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
var path = require('path');
var yaml = require('yamljs');

/**
 * Placeholder for schema object
 */
var schema = null;

/**
 * Loads the schema from specified file
 * @param {String} file The file path of the Gateway schema
 */
exports.schema = schema;
var loadSchema = function loadSchema(file) {
  exports.schema = schema = yaml.load(path.resolve(file));
};
exports.loadSchema = loadSchema;