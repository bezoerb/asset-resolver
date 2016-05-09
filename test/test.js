'use strict';
var fs = require('fs');
var http = require('http');
var path = require('path');
var expect = require('chai').expect;
var finalhandler = require('finalhandler');
var serveStatic = require('serve-static');
var Promise = require('es6-promise').Promise;
var resolver = require('../');

function read(file) {
	return fs.readFileSync(path.join(__dirname, 'fixtures', file));
}

function startServer(docroot) {
	var serve = serveStatic(docroot);
	var server = http.createServer(function (req, res) {
		var done = finalhandler(req, res);
		serve(req, res, done);
	});
	server.listen(3000);

	return server;
}

function check(file, base, filter, done) {
	if (!done && filter) {
		done = filter;
		filter = undefined;
	}
	var opts = {base: base};
	if (filter) {
		opts.filter = filter;
	}
	var contents = read(file);
	resolver.getResource(file, {base: base, filter: filter}).then(function (resource) {
		expect(resource.contents).to.eql(contents);
		done(null, resource);
	}).catch(done);
}

describe('asset-resolver', function () {
	var server;

	beforeEach(function () {
		server = startServer(path.join(__dirname, 'fixtures'));
	});
	afterEach(function (done) {
		server.close(done);
	});

	it('should fail on wrong url', function (done) {
		check('blank.gif', ['//localhost/', 'fixtures'], function (err) {
			expect(err).to.be.an.instanceof(Error);
			expect(err.message).to.have.string('blank.gif');
			done();
		});
	});

	it('should find the file by url', function (done) {
		check('blank.gif', ['//localhost:3000/', 'fixtures'], function (err, resource) {
			expect(err).to.eql(null);
			expect(resource.path).to.eql('http://localhost:3000/blank.gif');
			expect(resource.mime).to.eql('image/gif');
			done();
		});
	});

	it('should find the file by file', function (done) {
		check('check.svg', ['//localhost:3000/test/', path.join(__dirname, 'fixtures')], function (err, resource) {
			expect(err).to.eql(null);
			expect(resource.path).to.eql(path.join(__dirname, 'fixtures', 'check.svg'));
			expect(resource.mime).to.eql('image/svg+xml');
			done();
		});
	});

	it('should find the file by glob', function (done) {
		check('check.svg', 'test/*/', function (err, resource) {
			expect(err).to.eql(null);
			expect(resource.path).to.eql(path.join('test', 'fixtures', 'check.svg'));
			expect(resource.mime).to.eql('image/svg+xml');
			done();
		});
	});

	it('should use consider sync filter', function (done) {
		check('blank.gif', ['//localhost:3000/', 'fixtures'], function (resource) {
			expect(resource.path).to.eql('http://localhost:3000/blank.gif');
			expect(resource.mime).to.eql('image/gif');
			return resource.path !== 'http://localhost:3000/blank.gif';
		}, function (err) {
			expect(err).to.be.an.instanceof(Error);
			expect(err.message).to.have.string('blank.gif');
			expect(err.message).to.have.string('could not be resolved');
			expect(err.message).to.have.string('rejected by filter');
			done();
		});
	});

	it('should use consider async filter returning a promise', function (done) {
		check('check.svg', ['//localhost:3000/test/', path.join(__dirname, 'fixtures')], function (resource) {
			return new Promise(function (resolve, reject) {
				setTimeout(function () {
					expect(resource.path).to.eql(path.join(__dirname, 'fixtures', 'check.svg'));
					expect(resource.mime).to.eql('image/svg+xml');
					reject(new Error('FINE'));
				}, 1000);
			});
		}, function (err) {
			expect(err).to.be.an.instanceof(Error);
			expect(err.message).to.have.string('check.svg');
			expect(err.message).to.have.string('could not be resolved');
			expect(err.message).to.have.string('FINE');
			done();
		});
	});
});
