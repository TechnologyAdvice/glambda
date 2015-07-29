/* eslint no-process-exit: 0 */
const util = require('util')
const path = require('path')
const lambda = require(path.resolve(`${process.env.lambdas}/${process.argv[2]}/index`))

// Build context object for Lambda
const context = {
  succeed: (result) => {
    process.send({ type: 'success', output: result })
    context.done()
  },
  fail: (error) => {
    process.send({ type: 'error', output: error })
    context.done()
  },
  done: () => {
    process.send({ type: 'metric', output: { memory: util.inspect(process.memoryUsage()) }})
    process.send({ type: 'metric', output: { time: process.uptime() }})
    process.exit()
  }
}

// Call lambda's handler
lambda.handler(JSON.parse(process.env.event), context)