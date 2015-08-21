'use strict';

var chai = require('chai');
var expect = chai.expect;
var falcorRestify = require('../lib/index.js');
var Router = require('falcor-router');
var sinon = require('sinon');


describe('falcor-restify', function () {
	// Stub required request object methods
	var fakeReq = {
		log: {
			debug: sinon.stub()
		}
	};

	// Stub required response object methods
	var fakeRes = {
		send: sinon.stub().returnsThis()
	};

	// Set up basic router and immediately invoke the returned funciton
	// with fake req and res objects to check on stubbed functions
	function callFalcorRestify(req, res) {
		return falcorRestify(function () {
			return new Router([{
				route: 'route',
				get: function (pathSet) {
					return null;
				}
			}]);
		})(req, res, sinon.stub());
	}

	afterEach(function () {
		fakeReq.log.debug.reset();
		fakeRes.send.reset();
	});

	it('Calls get method', function (done) {
		// Fake GET request
		fakeReq.params = {
			method: 'get',
			paths: '[["genrelist",{"from":0,"to":5},"titles",{"from":0,"to":5},"name"]]'
		};

		callFalcorRestify(fakeReq, fakeRes);

		expect(fakeReq.log.debug.calledOnce).to.equal(true);

		expect(fakeRes.send.calledOnce).to.equal(true);
		expect(fakeRes.send.args[0][0]).to.equal(200);
		// Check that the res.send was called with a jsonGraph object
		expect(!!fakeRes.send.args[0][1].jsonGraph).to.equal(true);

		done();
	});

	it('Calls set method', function (done) {
		// Fake POST request
		fakeReq.params = {
			method: 'set',
			jsonGraph: '{"genrelist":{"0":{"titles":{"0":{"name":"jon"}}}},"paths":[["genrelist",0,"titles",0,"name"]]}'
		};

		callFalcorRestify(fakeReq, fakeRes);

		expect(fakeReq.log.debug.calledOnce).to.equal(true);

		expect(fakeRes.send.calledOnce).to.equal(true);
		expect(fakeRes.send.args[0][0]).to.equal(200);
		// Check that the res.send was called with a jsonGraph object
		expect(!!fakeRes.send.args[0][1].jsonGraph).to.equal(true);

		done();
	});
});
