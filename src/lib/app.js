// Deps
const express = require('express')
const bodyParser = require('body-parser')
const exec = require('child_process').exec

// Express setup
const service = express()
service.use(bodyParser.json())
const port = process.env.PORT || 8181

/**
 * Creates a new app instance
 * @class App
 */
export class App {

  /**
   * @constructor
   */
  constructor () {
    service.all('/api/:endpoint', this.runLambda)
    service.listen(port, () => {
      console.log(`Service running on ${port}`)
    })
  }

  /**
   * Builds payload and execs lambda
   * @param {Object} req Express req object
   * @param {Object} res Exptess res object
   */
  runLambda (req, res) {
    const evtBody = req.body
    const lambda = req.params.endpoint
    // Custom stuff...
    evtBody.operation = req.method
    // Execute lambda
    const proc = exec(`node build/lambdas/runner ${lambda}`, {
      env: {
        mock: true,
        event: JSON.stringify(evtBody)
      }
    })
    // Print pid
    console.log(`PID ${proc.pid} running ${lambda}`)
    // Await proc
    proc.stdout.on('data', (data) => res.status(200).send(data))
    proc.stderr.on('data', (err) => res.status(500).send(err))
  }

}