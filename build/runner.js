/*
 * Copyright (c) 2015 TechnologyAdvice
 */

/* eslint no-process-exit: 0, no-console: 0 */
'use strict';

var util = require('util');
var path = require('path');

// Override console.log to send messages back through proc emit
console.log = console.info = console.warn = console.error = console.debug = function () {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  process.send({
    type: 'debug',
    output: {
      lambda: process.argv[2],
      data: args
    }
  });
};

// Sets the lambda from its path
var lambda = require(path.resolve(process.env.lambdas + '/' + process.argv[2] + '/index'));

/**
 * Creates the context object passed to lambdas
 * @property context
 */
var context = {
  /**
   * Emit a success message with output
   * @param {Object|String} result The contents of the result
   */
  succeed: function succeed(result) {
    process.send({ type: 'success', output: result });
    context.done();
  },
  /**
   * Emit an error message with output
   * @param {Object|String} error The error object or message
   */
  fail: function fail(error) {
    process.send({ type: 'error', output: error });
    context.done();
  },
  /**
   * Emit closing metrics and end the lambda process
   */
  done: function done() {
    process.send({ type: 'metric', output: {
        lambda: process.argv[2],
        event: process.env.event,
        pid: process.pid,
        memory: util.inspect(process.memoryUsage()),
        time: process.uptime()
      } });
    process.exit();
  }
};

// Call lambda's handler
lambda.handler(JSON.parse(process.env.event), context);