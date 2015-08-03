/*
 * Copyright (c) 2015 TechnologyAdvice
 */

/* eslint no-param-reassign: 0 */
const path = require('path')
const yaml = require('yamljs')

import { config, log, service, runLambda } from './app'
import { fileExists, parseRouteParams } from './util'

/**
 * Placeholder for schema object
 * @parameter {Object} schema
 */
export let schema = null

/**
 * Placeholder for routes array
 * @parameter {Array} routes
 */
export let routes = []


/**
 * Loads the schema from specified file
 * @param {String} file The file path of the Gateway schema
 */
export const loadSchema = (file) => {
  // No checks, YAML error automagically
  schema = yaml.load(path.resolve(file))
}

/**
 * Walks schema to look for methods, when a method is found it creates a route
 * with the parent node key (the path), the current method, and the properties
 * of that method
 * @param {Object} node The node to traverse
 * @param {String} prevKey The key of the previous traversal for accessing parent/path
 */
export const walkSchema = (node = schema, prevKey = null) => {
  // Methods indicate traversal stops
  const methods = [ 'GET', 'POST', 'PUT', 'DELETE', 'HEAD', 'OPTIONS', 'PATCH' ]
  for (let prop in node) {
    // Ensure prop
    if ({}.hasOwnProperty.call(node, prop)) {
      if (methods.indexOf(prop) >= 0) {
        // Node is a method, push to router
        routes.push({ route: prevKey, method: prop, config: node[prop] })
      } else {
        // Route node, traverse
        walkSchema(node[prop], prop)
      }
    }
  }
}

/**
 * Maps template params to route params
 * @param {String} rte The route to modify
 * @param {Object} template The template object to match against
 * @returns {String} The formatted route
 */
export const mapTemplateParams = (route, template) => {
  for (let prop in template) {
    if ({}.hasOwnProperty.call(template, prop)) {
      let param = parseRouteParams(template[prop], prop, route)
      if (param) {
        route = param
        delete template[prop]
      }
    }
  }
  // Return modified route and template
  return { route, template }
}

/**
 * Adds a route based on the mapped route passed
 * @param {Object} route The route to build
 */
export const addRoute = (route) => {
  // Build ensure specified Lambda exists
  fileExists(`${config.lambdas}/${route.config.lambda}/index.js`).then(() => {
    // Add method route
    service[route.method.toLowerCase()](config.apiPath + route.route, (req, res) => {
      runLambda(route.config.lambda, route.config.templates['application/json'], req, res)
    })
  })
  .catch(() => {
    log.error('Missing Lambda', { name: route.config.lambda })
  })
}

/**
 * Builds routes and adds to the express service by mapping template params to
 * the path/route then binding to runLambda method
 */
const buildRoutes = () => {
  // Itterate over routes
  routes.forEach((rte) => {
    // Map template params
    let mappedRoutes = mapTemplateParams(rte.route, rte.config.templates['application/json'])
    rte.route = mappedRoutes.route
    rte.config.templates['application/json'] = mappedRoutes.template
    addRoute(rte)
  })
}

/**
 * Initializes the routes
 */
export const initRoutes = () => {
  // Walk the schema to build routes
  walkSchema(schema)
  // Map params and build express routes
  buildRoutes()
}
