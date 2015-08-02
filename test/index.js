var glambda = require('../build/app')

// Run
glambda.init({
  lambdas: './test/lambdas',
  schema: './test/gateway.yml',
  port: 8181,
  apiPath: '/api',
  log: true
})