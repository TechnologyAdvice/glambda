const path = require('path')
const yaml = require('yamljs')

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
  console.log(JSON.stringify(schema, null, 2))
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
 * @param {String} route The route to modify
 * @param {Object} template The template object to match against
 * @returns {String} The formatted route
 */
export const mapTemplateParams = (route, template) => {
  for (let prop in template) {
    if ({}.hasOwnProperty.call(template, prop)) {
      // Remove wrapper
      let param = template[prop].replace(`$input.params('`, '').replace(`')`, '')
      // Replace any occurences with express-param version of template param name
      route = route.replace(`{${param}}`, `:${prop}`)
    }
  }
  return route
}