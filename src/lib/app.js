// Deps
const express = require('express')
const bodyParser = require('body-parser')
const fork = require('child_process').fork
const path = require('path')

const runner = path.resolve('build/lib/runner')

// Express setup
const service = express()
service.use(bodyParser.json())
const port = process.env.PORT || 8181

/**
 * Builds payload and execs lambda
 * @param {Object} req Express req object
 * @param {Object} res Express res object
 * @param {String} lambdas Path to the lambdas directory
 */
const runLambda = (req, res, lambdas) => {
  const evtBody = req.body
  const lambda = req.params.endpoint
  // Custom stuff...
  evtBody.operation = req.method
  // Execute lambda
  const proc = fork(runner, [ lambda ], {
    env: {
      lambdas,
      event: JSON.stringify(evtBody)
    }
  })
  // Print pid
  console.log(`PID ${proc.pid} running ${lambda}`)
  // Await proc
  proc.on('message', (msg) => {
    switch (msg.type) {
      case 'success':
        res.status(200).send(msg.output)
        break
      case 'error':
        res.status(500).send(msg.output)
        break
      case 'metric':
        console.log(msg.output)
    }
  })
}

/**
 * Core app method, binds endpoints and starts listener
 * @param {string} lambdas Path to the lambdas directory
 */
export const app = (lambdas) => {
  service.all('/api/:endpoint', (req, res) => runLambda(req, res, lambdas))
  service.listen(port, () => {
    console.log(`Service running on ${port}`)
  })
}