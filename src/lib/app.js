// Deps
const express = require('express')
const bodyParser = require('body-parser')
const fork = require('child_process').fork
const path = require('path')
const log = require('bristol')
const _ = require('lodash')

// Setup logs
log.addTarget('console').withFormatter('human')

const runner = path.resolve('build/lib/runner')

// Express setup
const service = express()
service.use(bodyParser.json())

// Default config
export let config = {
  lambdas: './lambdas',
  port: 8181,
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
 * Builds payload and execs lambda
 * @param {Object} req Express req object
 * @param {Object} res Express res object
 * @param {String} lambdas Path to the lambdas directory
 */
const runLambda = (req, res, lambdas) => {
  const evt = req.body
  const lambda = req.params.endpoint
  // Custom stuff...
  evt.operation = req.method
  // Set event
  const event = JSON.stringify(evt)
  // Execute lambda
  const proc = fork(runner, [ lambda ], { env: { lambdas, event } })
  // Print pid
  procResponse({ type: 'metric', output: `PID ${proc.pid} running ${lambda}` })
  // Await proc
  proc.on('message', (msg) => procResponse(msg, res))
}

export const buildConfig = (cfg) => {
  // Against defaults
  _.extend(config, cfg)
  // Against env vars
  for (var prop in config) {
    let envVar = process.env['GL_' + prop.toUpperCase()]
    if (envVar) {
      config[prop] = envVar
    }
  }
}

/**
 * Core app method, binds endpoints and starts listener
 * @param {Object} config Path to the lambdas directory
 */
export const app = (cfg) => {
  buildConfig(cfg)
  service.all('/api/:endpoint', (req, res) => runLambda(req, res, config.lambdas))
  service.listen(config.port, () => {
    if (config.log) log.info(`Service running on ${config.port}`)
  })
}
