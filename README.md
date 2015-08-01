# GLambda

### AWS Gateway + Lambda Testing Module

A module for mocking and testing AWS [API Gateway](http://aws.amazon.com/api-gateway/)
in conjunction with [Lambda](http://aws.amazon.com/lambda/) functions.

## Introduction

## Setup

To see a fully functional demo, see the [`/test`](/test) directory. The `index.js`
file is setup to run using the [`lambdas`](/test/lambdas) and the [`gateway.yml`](/test/gateway.yml)
file. The tests run against this configuration as well.

After installing the npm module simply include it in a file where it will run and
set any config options on `init`:

```javascript
// Include the module
var glmock = require('glambda')
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

## The Gateway YAML Configuration

The [`gateway.yml`](/test/gateway.yml) format was designed to closely match the
AWS [API Gateway](http://aws.amazon.com/api-gateway/). The structure is intended
to appear similar to the Resource (left-hand) pane when editing an API in the
web interface.

```YAML
---
  /:
    /foo:
      GET:
          lambda: "foo"
          templates:
            application/json:
              method: "get"
      POST:
          lambda: "foo"
          templates:
            application/json:
              method: "post"
              body: "$input.json('$')"
      /foo/{fooId}:
        GET:
          lambda: "foo"
          templates:
            application/json:
              id: "$input.params('fooId')"
              method: "get"
        PUT:
          lambda: "foo"
          templates:
            application/json:
              id: "$input.params('fooId')"
              baz: "quz"
              body: "$input.json('$')"
```

It's simple to identify the core nodes of the tree, i.e. the paths of the requests
and their associated methods. To explain, the following shows results of a number
of requests made against the above configuration:

| PATH     | METHOD | BODY                 | RESPONSE/EVENT                                            |
| -------- | ------ | -------------------- | --------------------------------------------------------- |
| /        | ANY    | N/A                  | `METHOD NOT ALLOWED`                                      |
| /foo     | GET    | N/A                  | `{ method: 'get' }`                                       |
| /foo     | POST   | `{ fizz: 'buzz' }`   | `{ method: 'post', body: { fizz: 'buzz' }`                |
| /foo/123 | GET    | N/A                  | `{ method: 'get', fooId: 123 }`                           |
| /foo/123 | PUT    | `{ baz: 'quz' }`     | `{ method: 'put', fooId: 123, body: { baz: 'quz' } }`     |

## Makefile and Scripts

A `Makefile` is included for managing build and install tasks. The commands are
then referenced in the `package.json` `scripts` if that is the preferred
task method:

* `all` (default) will run all build tasks
* `start` will run the main script
* `clean` will remove the `/node_modules` directories
* `build` will transpile ES2015 code in `/src` to `/build`
* `test` will run all spec files in `/test/src`
* `cover` will run code coverage on all tests
* `lint` will lint all files in `/src`
* `doc` will run ESDoc on all files in `/src` and output to `/docs`
* `report` will run Plato static analysis on `/build` and output to `/report`
* `dev` will run...
  * linting, then...
  * tests, then...
  * build/transpile, then...
  * the main script.
* `watch` will run the `dev` task and rerun on change of `/src` files

**Test Inidividual File**

An individual spec can be run by specifying the `FILE`:

```
make test FILE=some.spec.js
```

The `FILE` is relative to the `test/src/` directory.

**Deploys**

For deploying releases, the `deploy TAG={VERSION}` can be used where `VERSION` can be:

```
<newversion> | major | minor | patch | premajor
```

Both `make {COMMAND}` and `npm run {COMMAND}` work for any of the above commands.