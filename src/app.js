/*
 * Copyright (c) 2015 TechnologyAdvice
 */

// Deps
const express = require('express')
const bodyParser = require('body-parser')
const fork = require('child_process').fork
const path = require('path')
const log = require('bristol')
const _ = require('lodash')

// Setup logs
log.addTarget('console').withFormatter('human')

// Default path to lambda runner
let runner = path.resolve(__dirname, './runner')

// Import router
import { loadSchema, initRoutes } from './router'

/**
 * Allows overriding default runner script
 * @param {String} runnerPath Path to the runner module
 */
export const setRunner = (runnerPath) => runner = path.resolve(runnerPath)

// Express setup
const service = express()
service.use(bodyParser.json())

/**
 * Default config object
 * @property config
 * @attribute {String} lambdas The path to the lambdas directory
 * @attribute {Number} port The port for the HTTP service
 * @attribute {String} apiPath The request path for the api
 * @attribute {Boolean} log Show or repress console output
 */
export let config = {
  lambdas: './lambdas',
  schema: './gateway.yml',
  port: 8181,
  apiPath: '/api',
  log: true
}

/**
 * Handles response from forked lambda runner procs
 * @param {Object} msg Message object from child proc
 * @param {Object} [res] Express response object
 */
export const procResponse = (msg, res) => {
  switch (msg.type) {
    case 'metric':
      if (config.log) log.info(msg.output)
      break
    case 'success':
      res.status(200).send(msg.output)
      break
    case 'error':
      res.status(500).send(msg.output)
      break
    default:
      log.error('Missing response type')
  }
}

/**
 * Parses the template from gateway and merges in the req.body as it's
 * intended property for the lambda
 * @param {Object} reqBody The req.body from express request
 * @param {Object} template The gateway template
 * @returns {Object} the full event to be passed to the Lambda
 */
export const parseBody = (reqBody = {}, template) => {
  let tmpBody = {}
  for (let prop in template) {
    if ({}.hasOwnProperty.call(template, prop)) {
      if (template[prop] === `$input.json('$')`) {
        // Replace prop with req.body
        tmpBody[prop] = reqBody
      } else {
        // Custom pass-throughs
        tmpBody[prop] = template[prop]
      }
    }
  }
  return tmpBody
}

/**
 * Builds the `event` payload with the request body and the method of the
 * call (`operation`). Forks a new runner process to the requested lambda
 * then awaits messaging from the lambda
 * @param {Object} req Express req object
 * @param {Object} res Express res object
 * @param {String} lambdas Path to the lambdas directory
 */
const runLambda = (lambda, template, req, res) => {
  // Build event
  const event = JSON.stringify(parseBody(req.body, template))
  // Set lambdas
  const lambdas = config.lambdas
  // Pass correct $HOME (helps with ~/.aws credentials)
  const HOME = process.env.HOME
  // Execute lambda
  const proc = fork(runner, [ lambda ], { env: { lambdas, event, HOME } })
  // Print pid
  procResponse({ type: 'metric', output: `PID ${proc.pid} running ${lambda}` })
  // Await proc messaging
  proc.on('message', (msg) => procResponse(msg, res))
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
    if ({}.hasOwnProperty.call(config, prop)) {
      let envVar = process.env['GL_' + prop.toUpperCase()]
      if (envVar) config[prop] = envVar
    }
  }
}

/**
 * Initialize testing service, binds endpoints to apiPath, handles the action
 * (runLambda) on calls and starts listener
 * @param {Object} [config] Path to the lambdas directory
 */
export const init = (cfg) => {
  // Setup config
  buildConfig(cfg)
  // Load schema into router
  loadSchema(config.schema)
  // Initialize all routes from gateway schema
  initRoutes(config.apiPath, service, runLambda)
  // Starts service
  service.listen(config.port, () => {
    if (config.log) log.info(`Service running on ${config.port}`)
  })
}
