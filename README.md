# Gateway + Lambda Testing Module

A module for mocking and testing AWS [API Gateway](http://aws.amazon.com/api-gateway/)
in conjunction with [Lambda](http://aws.amazon.com/lambda/) functions.

## Setup

To see a fully functional demo, see the [/test](/test) directory. The `index.js` 
file is setup to run using the [lambdas`](/test/lambdas) and the [gateway.yml](/test/gateway.yml) 
file. The tests run against this configuration as well.

After installing the npm module simply include it in a file where it will run and
set any config options on `init`:

```javascript
// Include the module
var glmock = require('gateway-lambda')
// Set options and init
glmock.init({
  lambdas: './lambdas',
  schema: './gateway.yml',
  port: 8181,
  apiPath: '/api',
  log: true
})
```

The above shows a standard set of config options:

* `lambdas`: Path to the directory containing lambdas
* `schema`: Path to the API gateway YAML config
* `port`: Port on which the HTTP server will run
* `apiPath`: Any path (proceeding root) to include in HTTP requests mapping
* `log`: Wether or not to log to console

Simply running the file created above will spin up the service, then accessing
the endpoints via the corresponding lambda name will spawn the Lambda function
and return its results.

## Makefile and Scripts

A `Makefile` is included for managing build and install tasks. The commands are
then referenced in the `package.json` `scripts` if that is the preferred
task method:

* `all` (default) will run all build tasks
* `start` will run the main script
* `clean` will remove the `/build` and `/node_modules` directories
* `build` will transpile ES2015 code in `/src` to `/build`
* `test` will run all spec files in `/test/src`
* `lint` will lint all files in `/src`
* `doc` will run ESDoc on all files in `/src` and output to `/docs`
* `report` will run Plato static analysis on `/build` and output to `/report`
* `dev` will run...
  * linting, then...
  * tests, then...
  * build/transpile, then...
  * the main script.
* `watch` will run the `dev` task and rerun on change of `/src` files

Both `make {COMMAND}` and `npm run {COMMAND}` work for any of the above commands.