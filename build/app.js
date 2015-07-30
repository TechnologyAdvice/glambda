/*
 * Copyright (c) 2015 TechnologyAdvice
 */

// Deps
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
var express = require('express');
var bodyParser = require('body-parser');
var fork = require('child_process').fork;
var path = require('path');
var log = require('bristol');
var _ = require('lodash');

// Setup logs
log.addTarget('console').withFormatter('human');

// Path to lambda runner
var runner = path.resolve('build/runner');

// Express setup
var service = express();
service.use(bodyParser.json());

/**
 * Default config object
 * @property config
 * @attribute {String} lambdas The path to the lambdas directory
 * @attribute {Number} port The port for the HTTP service
 * @attribute {String} apiPath The request path for the api
 * @attribute {Boolean} log Show or repress console output
 */
var config = {
  lambdas: './lambdas',
  port: 8181,
  apiPath: '/api',
  log: true
};

/**
 * Handles response from forked lambda runner procs
 * @param {Object} msg Message object from child proc
 * @param {Object} [res] Express response object
 */
exports.config = config;
var procResponse = function procResponse(msg, res) {
  switch (msg.type) {
    case 'metric':
      if (config.log) log.info(msg.output);
      break;
    case 'success':
      res.status(200).send(msg.output);
      break;
    case 'error':
      res.status(500).send(msg.output);
      break;
    default:
      log.error('Missing response type');
  }
};

/**
 * Builds the `event` payload with the request body and the method of the
 * call (`operation`). Forks a new runner process to the requested lambda
 * then awaits messaging from the lambda
 * @param {Object} req Express req object
 * @param {Object} res Express res object
 * @param {String} lambdas Path to the lambdas directory
 */
exports.procResponse = procResponse;
var runLambda = function runLambda(req, res) {
  var evt = req.body;
  var lambda = req.params.endpoint;
  // Map method to operation param
  evt.operation = req.method;
  // Set lambdas
  var lambdas = config.lambdas;
  // Set event
  var event = JSON.stringify(evt);
  // Execute lambda
  var proc = fork(runner, [lambda], { env: { lambdas: lambdas, event: event } });
  // Print pid
  procResponse({ type: 'metric', output: 'PID ' + proc.pid + ' running ' + lambda });
  // Await proc messaging
  proc.on('message', function (msg) {
    return procResponse(msg, res);
  });
};

/**
 * Combines the default config with any passed to init and overrides (lastly)
 * if there are any environment variables set
 * @param {Object} [cfg] The config passed through init
 */
var buildConfig = function buildConfig(cfg) {
  // Against defaults
  _.extend(config, cfg);
  // Against env vars
  for (var prop in config) {
    if (({}).hasOwnProperty.call(config, prop)) {
      var envVar = process.env['GL_' + prop.toUpperCase()];
      if (envVar) config[prop] = envVar;
    }
  }
};

/**
 * Initialize testing service, binds endpoints to apiPath, handles the action
 * (runLambda) on calls and starts listener
 * @param {Object} [config] Path to the lambdas directory
 */
exports.buildConfig = buildConfig;
var init = function init(cfg) {
  // Setup config
  buildConfig(cfg);
  // Binds to endpoint
  service.all(config.apiPath + '/:endpoint', function (req, res) {
    return runLambda(req, res);
  });
  // Starts service
  service.listen(config.port, function () {
    if (config.log) log.info('Service running on ' + config.port);
  });
};
exports.init = init;