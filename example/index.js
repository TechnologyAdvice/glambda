var glmock = require('../build/app')

// Run
glmock.init({
  lambdas: './lambdas',
  port: 8181,
  apiPath: '/api',
  log: true
})