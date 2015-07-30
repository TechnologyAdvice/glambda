var glmock = require('../build/app')

// Run
glmock.init({
  lambdas: './example/lambdas',
  port: 8181,
  apiPath: '/api',
  log: true
})