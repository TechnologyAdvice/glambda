var glmock = require('../build/app')

// Run
glmock.init({
  lambdas: './test/lambdas',
  schema: './test/gateway.yml',
  port: 8181,
  apiPath: '/api',
  log: true
})