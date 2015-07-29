// Deps
const express = require('express')
const bodyParser = require('body-parser')
const fork = require('child_process').fork
const path = require('path')
const log = require('bristol')

// Setup logs
log.addTarget('console')

const runner = path.resolve('build/lib/runner')

// Express setup
const service = express()
service.use(bodyParser.json())
const port = process.env.PORT || 8181

/**
 * Handles response from forked lambda runner procs
 * @param {Object} msg Message object from child proc
 * @param {Object} res Express response object
 * @param {String} output Output destination
 */
const procResponse = (msg, res, output) => {
  if (output === 'console') {
    log.info(msg.output)
  }
}

/**
 * Builds payload and execs lambda
 * @param {Object} req Express req object
 * @param {Object} res Express res object
 * @param {String} lambdas Path to the lambdas directory
 * @param {String} output Output destination
 */
const runLambda = (req, res, lambdas, output) => {
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
  proc.on('message', (msg) => procResponse(msg, res, output))
}

/**
 * Core app method, binds endpoints and starts listener
 * @param {String} lambdas Path to the lambdas directory
 * @param {String} output Designates output type `console` or `response`
 */
export const app = (lambdas, output = 'console') => {
  service.all('/api/:endpoint', (req, res) => runLambda(req, res, lambdas, output))
  service.listen(port, () => {
    log.info(`Service running on ${port}`)
  })
}