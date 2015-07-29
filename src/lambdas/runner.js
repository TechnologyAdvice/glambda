/* eslint no-process-exit: 0 */
const path = require('path')
//const process = require('process')
const util = require('util')
const lambda = require(path.resolve(`./build/lambdas/${process.argv[2]}/index`))

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
    process.send({ output: util.inspect(process.memoryUsage()) })
    process.exit()
  }
}

// Call lambda's handler
lambda.handler(JSON.parse(process.env.event), context)