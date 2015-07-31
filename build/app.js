/*
 * Copyright (c) 2015 TechnologyAdvice
 */

// Deps
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

// Import router

var _router = require('./router');

/**
 * Allows overriding default runner script
 * @param {String} runnerPath Path to the runner module
 */
var express = require('express');
var bodyParser = require('body-parser');
var fork = require('child_process').fork;
var path = require('path');
var _ = require('lodash');

// Setup logs
var log = require('bristol');
exports.log = log;
log.addTarget('console').withFormatter('human');

// Default path to lambda runner
var runner = path.resolve(__dirname, './runner');var setRunner = function setRunner(runnerPath) {
  return runner = path.resolve(runnerPath);
};

// Express setup
exports.setRunner = setRunner;
var service = express();
exports.service = service;
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
  schema: './gateway.yml',
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
 * Parses the template from gateway and merges in the req.body as it's
 * intended property for the lambda
 * @param {Object} reqBody The req.body from express request
 * @param {Object} template The gateway template
 * @returns {Object} the full event to be passed to the Lambda
 */
exports.procResponse = procResponse;
var parseBody = function parseBody(reqBody, template) {
  if (reqBody === undefined) reqBody = {};

  var tmpBody = {};
  for (var prop in template) {
    if (({}).hasOwnProperty.call(template, prop)) {
      if (template[prop] === '$input.json(\'$\')') {
        // Replace prop with req.body
        tmpBody[prop] = reqBody;
      } else {
        // Custom pass-throughs
        tmpBody[prop] = template[prop];
      }
    }
  }
  return tmpBody;
};

/**
 * Builds the `event` payload with the request body and the method of the
 * call (`operation`). Forks a new runner process to the requested lambda
 * then awaits messaging from the lambda
 * @param {Object} req Express req object
 * @param {Object} res Express res object
 * @param {String} lambdas Path to the lambdas directory
 */
exports.parseBody = parseBody;
var runLambda = function runLambda(lambda, template, req, res) {
  // Parse body against template
  var body = parseBody(req.body, template);
  // Build event by extending body with params
  var event = JSON.stringify(_.extend(body, req.params));
  // Set lambdas
  var lambdas = config.lambdas;
  // Pass correct $HOME (helps with ~/.aws credentials)
  var HOME = process.env.HOME;
  // Execute lambda
  var proc = fork(runner, [lambda], { env: { lambdas: lambdas, event: event, HOME: HOME } });
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
exports.runLambda = runLambda;
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
  // Load schema into router
  (0, _router.loadSchema)(config.schema);
  // Initialize all routes from gateway schema
  (0, _router.initRoutes)();
  // Starts service
  service.listen(config.port, function () {
    if (config.log) log.info('Service running on ' + config.port);
  });
};
exports.init = init;