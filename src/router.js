/* eslint no-param-reassign: 0 */
const path = require('path')
const yaml = require('yamljs')
const _ = require('lodash')

import { config, log, service, runLambda } from './app'

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
      } else if (_.isObject(node[prop])) {
        // Route node, traverse
        walkSchema(node[prop], prop)
      } else {
        log.error('Invalid property in gateway config', { property: prevKey + '> ' + prop })
        return
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
      if (template[prop].indexOf(`$input.params('`) >= 0) {
        // Remove wrapper
        let param = template[prop].replace(`$input.params('`, '').replace(`')`, '')
        // Replace any occurences with express-param version of template param name
        route = route.replace(`{${param}}`, `:${prop}`)
        // Remove entry from template
        delete template[prop]
      }
    }
  }
  // Return modified route and template
  return { route, template }
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
    let lambda = rte.config.lambda
    rte.route = mappedRoutes.route
    rte.config.templates['application/json'] = mappedRoutes.template
    // Build service method
    service[rte.method.toLowerCase()](config.apiPath + rte.route, (req, res) => {
      runLambda(lambda, rte.config.templates['application/json'], req, res)
    })
  })
}

/**
 * Initializes the routes
 * @param {String} apiPath Any special API pathing (preceeding route-specific)
 * @param {Object} service The express service instance
 * @param {Function} runLambda The lambda runner function
 */
export const initRoutes = () => {
  // Walk the schema to build routes
  walkSchema(schema)
  // Map params and build express routes
  buildRoutes()
}
