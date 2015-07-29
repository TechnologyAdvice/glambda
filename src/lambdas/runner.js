const path = require('path')
//const process = require('process')
//const util = require('util')
const lambda = require(path.resolve(`./build/lambdas/${process.argv[2]}/index`))

// Build context object for Lambda
const context = {
  succeed: (result) => process.send({ output: result }),
  fail: (error) => process.send({ error: error })
}

//console.log(util.inspect(process.memoryUsage()))

// Call lambda's handler
lambda.handler(JSON.parse(process.env.event), context)