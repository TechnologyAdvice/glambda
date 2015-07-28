# Gateway + Lambda Dev Environment

This project establishes a mock of the workflow and components for creating
projects utilizing API Gateway with Lambda functions.

The core concept is to create a workflow which mimics any staging/production
deploys while minimizing the need for any special flags or configurations. This
is achieved by separating the Gateway as a (local) express service which triggers
Lambdas to run as their own processes.

## TODO's

* Expand console output to include memory for perf analysis
* Create Gateway config for mocking endpoints
  * Match Gateway conventions for consistency
  * Modify express routing to respond to config
* Mock integration tests
* Mock system tests

## Getting Started

Simply run `make` then `make dev`. To run interactive (auto-reload) run `make watch`.

The repo comes with 2 lambdas which correspond to endpoints: `apples` and `oranges`.
These can be tested by running `curl http://localhost:8181/api/apples` and will
respond with the name of the lambda and the event object.

Sending `POST` or `PUT` with `Content-Type: application/json` headers and a JSON
body will include the params in the returned object.

## Testing

The workflow focuses on separation of testing into the three main components at
distinct positions:

* **Unit**: Testing of the individual Lambdas internal to the project
* **Integration**: Testing the API with mock data and mock endpoints/lambdas
* **System**: Testing the API via local DB and model endpoints

## Makefile and Scripts

A `Makefile` is included for managing build and install tasks. The commands are
then referenced in the `package.json` `scripts` if that is the preferred
task method:

* `all` (default) will run all build tasks
* `start` will run the main script
* `clean` will remove the `/dist` and `/node_modules` directories
* `build` will transpile ES2015 code in `/src` to `/dist`
* `test` will run all spec files in `/test/src`
* `lint` will lint all files in `/src`
* `doc` will run ESDoc on all files in `/src` and output to `/docs`
* `dev` will run...
  * linting, then...
  * tests, then...
  * build/transpile, then...
  * the main script.
* `watch` will run the `dev` task and rerun on change of `/src` files

Both `make {COMMAND}` and `npm run {COMMAND}` work for any of the above commands.