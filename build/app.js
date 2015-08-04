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

var _util = require('./util');

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
 * @attribute {String} schema The path to the Gateway YAML config
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
 * Calls log output method
 * @param {String} type Type of log message to write
 * @param {String|Object} msg Message body of log
 */
exports.config = config;
var procLog = function procLog(type) {
  /* istanbul ignore if  */
  if (config.log) log[type](arguments[1], arguments[2]);
};

/**
 * Handles response from forked lambda runner procs
 * @param {Object} msg Message object from child proc
 * @param {Object} [res] Express response object
 */
exports.procLog = procLog;
var procResponse = function procResponse(msg, res) {
  switch (msg.type) {
    case 'metric':
      procLog('info', 'Lambda Processed', msg.output);break;
    case 'success':
      res.status(200).send(msg.output);break;
    case 'error':
      res.status(500).send(msg.output);break;
    default:
      procLog('error', 'Missing response type');
  }
};

/**
 * Parses the properties from the template and then calls `parseRequestParams`
 * to align variable properties with their template keys
 * @param {Object} reqBody The req.body from express request
 * @param {Object} template The gateway template
 * @returns {Object} the full event to be passed to the Lambda
 */
exports.procResponse = procResponse;
var parseRequest = function parseRequest(req, template) {
  var tmpBody = {};
  for (var prop in template) {
    /* istanbul ignore else  */
    if (({}).hasOwnProperty.call(template, prop)) {
      tmpBody[prop] = (0, _util.parseRequestParams)(template[prop], req);
    }
  }
  return tmpBody;
};

/**
 * Builds the `event` payload with the request body and then forks a new
 * runner process to the requested lambda. Awaits messaging from the lambda
 * to return response payload and display log information
 * @param {String} lambda The lambda to run
 * @param {Object} template The gateway template
 * @param {Object} req Express req object
 * @param {Object} res Express res object
 */
exports.parseRequest = parseRequest;
var runLambda = function runLambda(lambda, template, req, res) {
  // Parse body against template
  var body = parseRequest(req, template);
  // Build event by extending body with params
  var event = JSON.stringify(_.extend(body, req.params));
  // Execute lambda
  fork(runner, [lambda], {
    env: { lambdas: config.lambdas, event: event, HOME: process.env.HOME }
  }).on('message', function (msg) {
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
    /* istanbul ignore else  */
    if (({}).hasOwnProperty.call(config, prop)) {
      var envVar = process.env['GL_' + prop.toUpperCase()];
      if (envVar) config[prop] = envVar;
    }
  }
};

/**
 * Initialize the service by building the config, loading the (YAML) Gateway
 * API configuration and then initializing routes on Express and finally
 * starting the service.
 * @param {Object} [config] The main service configuration
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
    procLog('info', 'Service running', { port: config.port });
  });
};
exports.init = init;