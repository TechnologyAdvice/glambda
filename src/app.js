/*
 * Copyright (c) 2015 TechnologyAdvice
 */

// Deps
const express = require('express')
const bodyParser = require('body-parser')
const fork = require('child_process').fork
const path = require('path')
const _ = require('lodash')

// Setup logs
export const log = require('bristol')
log.addTarget('console').withFormatter('human')

// Default path to lambda runner
let runner = path.resolve(__dirname, './runner')

// Import router
import { loadSchema, initRoutes } from './router'
import { parseRequestParams } from './util'

/**
 * Allows overriding default runner script
 * @param {String} runnerPath Path to the runner module
 */
export const setRunner = (runnerPath) => runner = path.resolve(runnerPath)

/**
 * Default config object
 * @property config
 * @attribute {String} lambdas The path to the lambdas directory
 * @attribute {String} schema The path to the Gateway YAML config
 * @attribute {Number} port The port for the HTTP service
 * @attribute {String} apiPath The request path for the api
 * @attribute {Boolean} log Show or repress console output
 */
export let config = {
  lambdas: './lambdas',
  schema: './gateway.yml',
  port: 8181,
  apiPath: '/api',
  log: true,
  cors: {
    origin: '*',
    methods: 'GET,PUT,POST,DELETE,OPTIONS',
    headers: 'Content-Type, Authorization, Content-Length, X-Requested-With'
  }
}

// Express setup
export const service = express()

// CORS
export const setCORS = () => {
  service.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', config.cors.origin)
    res.header('Access-Control-Allow-Methods', config.cors.methods)
    res.header('Access-Control-Allow-Headers', config.cors.headers)
    if (req.method === 'OPTIONS') {
      res.send(200)
    } else {
      next()
    }
  })
}

// Body parser
service.use(bodyParser.json())

/**
 * Calls log output method
 * @param {String} type Type of log message to write
 * @param {String|Object} msg Message body of log
 */
export const procLog = (type, ...msg) => {
  /* istanbul ignore if  */
  if (config.log) log[type](msg[0], msg[1])
}

/**
 * Handles response from forked lambda runner procs
 * @param {Object} msg Message object from child proc
 * @param {Object} [res] Express response object
 */
export const procResponse = (msg, res) => {
  switch (msg.type) {
    case 'metric': procLog('info', 'Lambda Processed', msg.output); break
    case 'debug': procLog('info', 'Lambda Debug', msg.output); break
    case 'success': res.status(200).send(msg.output); break
    case 'error': res.status(500).send(msg.output); break
    default: procLog('error', 'Missing response type')
  }
}

/**
 * Parses the properties from the template and then calls `parseRequestParams`
 * to align variable properties with their template keys
 * @param {Object} req The request object
 * @param {Object} template The gateway template
 * @returns {Object} the full event to be passed to the Lambda
 */
export const parseRequest = (req, template) => {
  let tmpBody = {}
  for (let prop in template) {
    /* istanbul ignore else  */
    if ({}.hasOwnProperty.call(template, prop)) {
      tmpBody[prop] = parseRequestParams(template[prop], req)
    }
  }
  return tmpBody
}

/**
 * Builds the `event` payload with the request body and then forks a new
 * runner process to the requested lambda. Awaits messaging from the lambda
 * to return response payload and display log information
 * @param {String} lambda The lambda to run
 * @param {Object} template The gateway template
 * @param {Object} req Express req object
 * @param {Object} res Express res object
 */
export const runLambda = (lambda, template, req, res) => {
  // Parse body against template
  const body = parseRequest(req, template)
  // Build event by extending body with params
  const event = JSON.stringify(_.extend(body, req.params))
  // Build env to match current envirnment, add lambdas and event
  const env = _.extend({ lambdas: config.lambdas, event }, process.env)
  // Execute lambda
  fork(runner, [ lambda ], { env }).on('message', (msg) => procResponse(msg, res))
}

/**
 * Combines the default config with any passed to init and overrides (lastly)
 * if there are any environment variables set
 * @param {Object} [cfg] The config passed through init
 */
export const buildConfig = (cfg) => {
  // Against defaults
  _.extend(config, cfg)
  // Against env vars
  for (let prop in config) {
    /* istanbul ignore else  */
    if ({}.hasOwnProperty.call(config, prop)) {
      let envVar = process.env['GL_' + prop.toUpperCase()]
      if (envVar) config[prop] = envVar
    }
  }
  // Apply config to CORS
  setCORS()
}

/**
 * Initialize the service by building the config, loading the (YAML) Gateway
 * API configuration and then initializing routes on Express and finally
 * starting the service.
 * @param {Object} [config] The main service configuration
 */
export const init = (cfg) => {
  // Setup config
  buildConfig(cfg)
  // Load schema into router
  loadSchema(config.schema)
  // Initialize all routes from gateway schema
  initRoutes()
  // Starts service
  service.listen(config.port, () => {
    procLog('info', 'Service running', { port: config.port })
  })
}
