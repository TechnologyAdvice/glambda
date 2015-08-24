var glambda = require('../build/app')

// Run
glambda.init({
  lambdas: './test/lambdas',
  schema: './test/gateway.yml',
  port: 8181,
  apiPath: '/api',
  log: true,
  cors: {
    origin: '*',
    methods: 'GET,PUT,POST,DELETE,OPTIONS',
    headers: 'Content-Type, Authorization, Content-Length, X-Requested-With'
  }
})