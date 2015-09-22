'use strict';
var expect = require('chai').expect;
var finalhandler = require('finalhandler');
var http = require('http');
var serveStatic = require('serve-static');
var resolver = require('../');
var fs = require('fs');
var path = require('path');

function read(file) {
	return fs.readFileSync(path.join(__dirname, 'fixtures', file), 'binary');
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

function check(file, base, done) {
	var contents = read(file);
	resolver.getResource(file, {base: base}).then(function (resource) {
		expect(resource.contents).to.eql(contents);
		done(resource);
	});
}

describe('postcss-image-inliner', function () {
	var server;

	beforeEach(function () {
		server = startServer(path.join(__dirname, 'fixtures'));
	});
	afterEach(function (done) {
		server.close(done);
	});

	it('should find the file by url', function (done) {
		check('blank.gif', ['//localhost:3000/', 'fixtures'], function (resource) {
			expect(resource.path).to.eql('http://localhost:3000/blank.gif');
			expect(resource.mime).to.eql('image/gif');
			done();
		});
	});

	it('should find the file by file', function (done) {
		check('check.svg', ['//localhost:3000/test/', path.join(__dirname,'fixtures')], function (resource) {
			expect(resource.path).to.eql(path.join(__dirname,'fixtures','check.svg'));
			expect(resource.mime).to.eql('image/svg+xml');
			done();
		});
	});
});
