import fs from 'fs';
import http from 'http';
import path from 'path';
import finalhandler from 'finalhandler';
import serveStatic from 'serve-static';
import Promise from 'bluebird';
import getPort from 'get-port';
import test from 'ava';
import resolver from '../';

const readFile = Promise.promisify(fs.readFile);

// start fresh server before tests
test.beforeEach(async t => {
	const base = path.join(__dirname, 'fixtures');
	const serve = serveStatic(base);
	const port = await getPort();
	const server = http.createServer((req, res) => serve(req, res, finalhandler(req, res)));

	server.listen(port);

	t.context.port = port;
	t.context.server = server;
});

// stop server in any case
test.afterEach.cb.always(t => {
	t.context.server.close(t.end);
});

test('should fail on wrong url', async t => {
	const res = resolver.getResource('blank.gif', {base: ['//localhost/']});
	t.throws(res, Error, /.*blank\.gif.*/);
});

test('should find the file by url', async t => {
	const expected = await readFile('fixtures/blank.gif');
	const res = await resolver.getResource('blank.gif', {base: ['//localhost:' + t.context.port + '/', 'fixture']});

	t.is(res.contents.toString(), expected.toString());
	t.is(res.path, 'http://localhost:' + t.context.port + '/blank.gif');
	t.is(res.mime, 'image/gif');
});

test('should find the file by file', async t => {
	const expected = await readFile('fixtures/check.svg');
	const res = await resolver.getResource('check.svg', {base: ['//localhost:' + t.context.port + '/test/', 'fixtures']});

	t.is(res.contents.toString(), expected.toString());
	t.is(res.path, 'fixtures/check.svg');
	t.is(res.mime, 'image/svg+xml');
});

test('should find the file by glob', async t => {
	const expected = await readFile('fixtures/check.svg');
	const res = await resolver.getResource('check.svg', {base: ['./*/']});

	t.is(res.contents.toString(), expected.toString());
	t.is(res.path, 'fixtures/check.svg');
	t.is(res.mime, 'image/svg+xml');
});

test('should use consider sync filter', async t => {
	const base = ['//localhost:' + t.context.port + '/'];
	const filter = resource => {
		return resource.path !== 'http://localhost:' + t.context.port + '/blank.gif' || resource.mime !== 'image/gif';
	};

	const res = resolver.getResource('blank.gif', {base, filter});

	t.throws(res, Error, /blank\.gif.*could not be resolved.*rejected by filter/);
});

test('should use consider async filter returning a promise', async t => {
	const base = ['//localhost/', path.join(__dirname, 'fixtures')];
	const filter = () => {
		return new Promise(function (resolve, reject) {
			setTimeout(function () {
				reject(new Error('FINE'));
			}, 1000);
		});
	};

	const res = resolver.getResource('check.svg', {base, filter});

	t.throws(res, Error, /check\.svg.*could not be resolved.*FINE/);
});
