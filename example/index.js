var glmock = require('../build/lib/app')

// Run
glmock.init({
  lambdas: './example/lambdas',
  port: 8181,
  apiPath: '/api',
  log: true
})