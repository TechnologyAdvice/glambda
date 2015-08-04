/*
 * Copyright (c) 2015 TechnologyAdvice
 */

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

/**
 * Abstracts parsing of routes against template values
 * @param {String} value The value of the template element
 * @param {String} key The property name of the template element
 * @param {String} route The route to check/modify
 */
export const parseRouteParams = (value, key, route) => {
  if (value.indexOf(`$input.params('`) >= 0) {
    // Remove wrapper
    let param = value.replace(`$input.params('`, '').replace(`')`, '')
    // Ensure route contains match, replace
    if (route.indexOf(`{${param}}`) >= 0) return route.replace(`{${param}}`, `:${key}`)
    // Not matched
    return false
  }
  return false
}

/**
 * Abstracts parsing of body against template values
 * @param {String} value The value of the template element
 * @param {Object} body The request body
 * @returns {String} The value of the body property requested by the template
 */
export const parseRequestParams = (value, req) => {
  // Body
  if (value.indexOf(`$input.json('$`) >= 0) {
    // Get the name to check
    let name = value.replace(`$input.json('$`, '').replace(`')`, '')
    // Return the entire body
    if (!name.length) return req.body
    // Return the specific property of the body (or null if DNE)
    name = name.replace(/^\./, '') // Remove leading dot
    return ({}.hasOwnProperty.call(req.body, name)) ? req.body[name] : null
  }
  // Param (querystring or header)
  if (value.indexOf(`$input.param('`) >= 0) {
    /// Remove wrapper
    let param = value.replace(`$input.params('`, '').replace(`')`, '')
    // Return if matching querysting
    if ({}.hasOwnProperty.call(req.query, param)) return req.query[param]
  }
  // Custom value passed through
  return value
}
