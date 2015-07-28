const path = require('path')
const lambda = require(path.resolve(`./build/lambdas/${process.argv[2]}/index`))

// Build context object for Lambda
const context = {
  succeed: (result) => console.log(result),
  fail: (error) => console.error(error)
}

// Call lambda's handler
lambda.handler(JSON.parse(process.env.event), context)