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
 * Walks schema to look for request methods (verbs), when a method is found it
 * creates a route with the parent node key (the path), the current method,
 * and the properties of that method (the template)
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
 * Iterates over the properties of the template and calls `parseRouteParams` to
 * convert the bracket-delimited params with colon-lead (Express-style) route
 * params with the template-designated key/property name
 * @param {String} route The route to modify
 * @param {Object} template The template object to match against
 * @returns {String} The formatted route
 */
exports.walkSchema = walkSchema;
var mapTemplateParams = function mapTemplateParams(route, template) {
  for (var prop in template) {
    if (({}).hasOwnProperty.call(template, prop)) {
      var param = (0, _util.parseRouteParams)(template[prop], prop, route);
      if (param) {
        route = param;
        delete template[prop];
      }
    }
  }
  // Return modified route and template
  return { route: route, template: template };
};

/**
 * Ensures that the lambda exists (on init/load) then creates and Express
 * verb+route object for the specific request
 * @param {Object} route The route to add
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
 * Itterates over the routes array to map template parameters, set the route
 * property, config > templates and call `addRoute`
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
 * Initializes the routes by walking the Gateway schema then running `buildRoutes`
 * to load into Express object
 */
var initRoutes = function initRoutes() {
  // Walk the schema to build routes
  walkSchema(schema);
  // Map params and build express routes
  buildRoutes();
};
exports.initRoutes = initRoutes;