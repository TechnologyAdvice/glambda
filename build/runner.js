/*
 * Copyright (c) 2015 TechnologyAdvice
 */

/* eslint no-process-exit: 0 */
'use strict';

var util = require('util');
var path = require('path');

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
    process.send({ type: 'metric', output: { memory: util.inspect(process.memoryUsage()) } });
    process.send({ type: 'metric', output: { time: process.uptime() } });
    process.exit();
  }
};

// Emit initialization metric
process.send({ type: 'metric', output: { lambda: process.argv[2], pid: process.pid } });

// Call lambda's handler
lambda.handler(JSON.parse(process.env.event), context);