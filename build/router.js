/*
 * Copyright (c) 2015 TechnologyAdvice
 */

/* eslint no-param-reassign: 0 */
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _app = require('./app');

var _util = require('./util');

/**
 * Placeholder for schema object
 * @parameter {Object} schema
 */
var path = require('path');
var yaml = require('yamljs');

var schema = null;

/**
 * Placeholder for routes array
 * @parameter {Array} routes
 */
exports.schema = schema;
var routes = [];

/**
 * Loads the schema from specified file
 * @param {String} file The file path of the Gateway schema
 */
exports.routes = routes;
var loadSchema = function loadSchema(file) {
  // No checks, YAML error automagically
  exports.schema = schema = yaml.load(path.resolve(file));
};

/**
 * Walks schema to look for methods, when a method is found it creates a route
 * with the parent node key (the path), the current method, and the properties
 * of that method
 * @param {Object} node The node to traverse
 * @param {String} prevKey The key of the previous traversal for accessing parent/path
 */
exports.loadSchema = loadSchema;
var walkSchema = function walkSchema() {
  var node = arguments.length <= 0 || arguments[0] === undefined ? schema : arguments[0];
  var prevKey = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

  // Methods indicate traversal stops
  var methods = ['GET', 'POST', 'PUT', 'DELETE', 'HEAD', 'OPTIONS', 'PATCH'];
  for (var prop in node) {
    // Ensure prop
    if (({}).hasOwnProperty.call(node, prop)) {
      if (methods.indexOf(prop) >= 0) {
        // Node is a method, push to router
        routes.push({ route: prevKey, method: prop, config: node[prop] });
      } else {
        // Route node, traverse
        walkSchema(node[prop], prop);
      }
    }
  }
};

/**
 * Maps template params to route params
 * @param {String} rte The route to modify
 * @param {Object} template The template object to match against
 * @returns {String} The formatted route
 */
exports.walkSchema = walkSchema;
var mapTemplateParams = function mapTemplateParams(route, template) {
  for (var prop in template) {
    if (({}).hasOwnProperty.call(template, prop)) {
      if (template[prop].indexOf('$input.params(\'') >= 0) {
        // Remove wrapper
        var param = template[prop].replace('$input.params(\'', '').replace('\')', '');
        // Replace any occurences with express-param version of template param name
        route = route.replace('{' + param + '}', ':' + prop);
        // Remove entry from template
        delete template[prop];
      }
    }
  }
  // Return modified route and template
  return { route: route, template: template };
};

/**
 * Adds a route based on the mapped route passed
 * @param {Object} route The route to build
 */
exports.mapTemplateParams = mapTemplateParams;
var addRoute = function addRoute(route) {
  // Build ensure specified Lambda exists
  (0, _util.fileExists)(_app.config.lambdas + '/' + route.config.lambda + '/index.js').then(function () {
    // Add method route
    _app.service[route.method.toLowerCase()](_app.config.apiPath + route.route, function (req, res) {
      (0, _app.runLambda)(route.config.lambda, route.config.templates['application/json'], req, res);
    });
  })['catch'](function () {
    _app.log.error('Missing Lambda', { name: route.config.lambda });
  });
};

/**
 * Builds routes and adds to the express service by mapping template params to
 * the path/route then binding to runLambda method
 */
exports.addRoute = addRoute;
var buildRoutes = function buildRoutes() {
  // Itterate over routes
  routes.forEach(function (rte) {
    // Map template params
    var mappedRoutes = mapTemplateParams(rte.route, rte.config.templates['application/json']);
    rte.route = mappedRoutes.route;
    rte.config.templates['application/json'] = mappedRoutes.template;
    addRoute(rte);
  });
};

/**
 * Initializes the routes
 */
var initRoutes = function initRoutes() {
  // Walk the schema to build routes
  walkSchema(schema);
  // Map params and build express routes
  buildRoutes();
};
exports.initRoutes = initRoutes;