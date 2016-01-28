module.exports =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	// Description:
	//   Notify when a GitHub issue has a label applied.
	// Dependencies:
	//   None
	// Configuration:
	//   HUBOT_GITHUB_NOTIFIER_SECRET
	//   HUBOT_GITHUB_NOTIFIER_LABEL_FILTER (optional, comma seperated)
	// Commands:
	//   None
	// Notes:
	//   This script listens for webhooks configured on GitHub.
	//   Configure the GitHub webhooks to submit to:
	//   https://example.com/hubot/github-issue-label/room-name-here
	// Author:
	//   ritterim

	'use strict';

	var crypto = __webpack_require__(1);
	var bufferEq = __webpack_require__(2);

	module.exports = function (robot) {
	    robot.router.post('/hubot/github-issue-label/:room', function (req, res, next) {
	        if (!process.env.HUBOT_GITHUB_NOTIFIER_SECRET) {
	            robot.logger.error('HUBOT_GITHUB_NOTIFIER_SECRET environment variable is not specified.');

	            res.status(500);
	            res.send('Configuration is required.');
	        } else if (!signatureValid(req)) {
	            robot.logger.warning('Invalid secret specified in ' + req.url + '.');

	            res.status(401);
	            res.send('Unauthorized');
	        } else if (req.body.action === 'opened' || req.body.action === 'labeled') {
	            (function () {
	                var labelFilter = process.env.HUBOT_GITHUB_NOTIFIER_LABEL_FILTER === undefined ? undefined : process.env.HUBOT_GITHUB_NOTIFIER_LABEL_FILTER.split(',').map(function (x) {
	                    return x.trim();
	                });

	                var issue = req.body.issue;
	                var labelNames = issue.labels.length > 0 ? issue.labels.map(function (x) {
	                    return x.name.trim();
	                }) : [];

	                // If no label filter or there's any intersection between notifier labels and issue labels
	                if (labelNames.length > 0 && (!labelFilter || labelFilter.some(function (x) {
	                    return labelNames.indexOf(x) !== -1;
	                }))) {
	                    var message = (req.body.action === 'opened' ? 'New issue' : 'Label applied') + ' \'' + issue.title + '\' (' + issue.labels.map(function (x) {
	                        return x.name;
	                    }).sort().join(', ') + ') ' + issue.html_url;
	                    robot.send({ room: req.params.room }, message);
	                }

	                res.send('ok');
	            })();
	        } else {
	            res.send('ok');
	        }
	    });

	    function signatureValid(req) {
	        // http://stackoverflow.com/a/7480211
	        var expected = 'sha1=' + crypto.createHmac('sha1', process.env.HUBOT_GITHUB_NOTIFIER_SECRET).update(JSON.stringify(req.body)).digest('hex');

	        return bufferEq(new Buffer(req.headers['x-hub-signature']), new Buffer(expected));
	    };
	};

/***/ },
/* 1 */
/***/ function(module, exports) {

	module.exports = require("crypto");

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	/*jshint node:true */
	'use strict';
	var Buffer = __webpack_require__(3).Buffer; // browserify
	var SlowBuffer = __webpack_require__(3).SlowBuffer;

	module.exports = bufferEq;

	function bufferEq(a, b) {

	  // shortcutting on type is necessary for correctness
	  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
	    return false;
	  }

	  // buffer sizes should be well-known information, so despite this
	  // shortcutting, it doesn't leak any information about the *contents* of the
	  // buffers.
	  if (a.length !== b.length) {
	    return false;
	  }

	  var c = 0;
	  for (var i = 0; i < a.length; i++) {
	    /*jshint bitwise:false */
	    c |= a[i] ^ b[i]; // XOR
	  }
	  return c === 0;
	}

	bufferEq.install = function() {
	  Buffer.prototype.equal = SlowBuffer.prototype.equal = function equal(that) {
	    return bufferEq(this, that);
	  };
	};

	var origBufEqual = Buffer.prototype.equal;
	var origSlowBufEqual = SlowBuffer.prototype.equal;
	bufferEq.restore = function() {
	  Buffer.prototype.equal = origBufEqual;
	  SlowBuffer.prototype.equal = origSlowBufEqual;
	};


/***/ },
/* 3 */
/***/ function(module, exports) {

	module.exports = require("buffer");

/***/ }
/******/ ]);
