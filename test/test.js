'use strict';

const fs = require('fs');
const http = require('http');
const path = require('path');
const {promisify} = require('util');
const finalhandler = require('finalhandler');
const serveStatic = require('serve-static');
const getPort = require('get-port');
const test = require('ava');
const resolver = require('..');

const readFile = promisify(fs.readFile);

// Start fresh server before tests
test.beforeEach(async (t) => {
  const base = path.join(__dirname, 'fixtures');
  const serve = serveStatic(base);
  const port = await getPort();
  const server = http.createServer((request, response) =>
    serve(request, response, finalhandler(request, response))
  );

  server.listen(port);

  t.context.port = port;
  t.context.server = server;
});

// Stop server in any case
test.afterEach.cb((t) => {
  t.context.server.close(t.end);
});

test('should fail on wrong url', async (t) => {
  const error = await t.throwsAsync(
    async () => {
      await resolver.getResource('blank.gif', {
        base: ['//localhost/']
      });
    },
    {instanceOf: Error}
  );

  t.regex(error.message, /.*blank\.gif.*/);
});

test('should find the file by url', async (t) => {
  const expected = await readFile(path.join(__dirname, 'fixtures/blank.gif'));
  const result = await resolver.getResource('blank.gif', {
    base: [`//localhost:${t.context.port}/`, 'fixture']
  });

  t.is(result.contents.toString(), expected.toString());
  t.is(result.path, `http://localhost:${t.context.port}/blank.gif`);
  t.is(result.mime, 'image/gif');
});

test('should find the file by file', async (t) => {
  const expected = await readFile(path.join(__dirname, 'fixtures/check.svg'));
  const result = await resolver.getResource('check.svg', {
    base: [`//localhost:${t.context.port}/test/`, 'test/fixtures']
  });

  t.is(result.contents.toString(), expected.toString());
  t.is(result.path, path.join(__dirname, 'fixtures', 'check.svg'));
  t.is(result.mime, 'image/svg+xml');
});

test('should find the file by glob', async (t) => {
  const expected = await readFile(path.join(__dirname, 'fixtures/check.svg'));
  const result = await resolver.getResource('check.svg', {
    base: [path.join(__dirname, '/*')]
  });

  t.is(result.contents.toString(), expected.toString());
  t.is(result.path, path.join(__dirname, 'fixtures', 'check.svg'));
  t.is(result.mime, 'image/svg+xml');
});

test('should use consider sync filter', async (t) => {
  const base = [`//localhost:${t.context.port}/`];
  const filter = (resource) => {
    return (
      resource.path !== `http://localhost:${t.context.port}/blank.gif` ||
      resource.mime !== 'image/gif'
    );
  };

  const error = await t.throwsAsync(
    async () => {
      await resolver.getResource('blank.gif', {base, filter});
    },
    {instanceOf: Error}
  );

  t.regex(error.message, /blank\.gif.*could not be resolved/);
  t.regex(error.message, /.*rejected by filter/);
});

test('should show all error messages', async (t) => {
  const base = [
    `//localhost:${t.context.port}/`,
    `//localhost:100000/`,
    __dirname
  ];
  const filter = (resource) => {
    return (
      resource.path !== `http://localhost:${t.context.port}/blank.gif` ||
      resource.mime !== 'image/gif'
    );
  };

  const error = await t.throwsAsync(
    async () => {
      await resolver.getResource('blank.gif', {base, filter});
    },
    {instanceOf: Error}
  );

  t.regex(error.message, /blank\.gif.*could not be resolved/);
  t.regex(error.message, /Invalid URL.*10{5}/);
  t.regex(error.message, /No such file or directory/);
});

test('should use consider async filter returning a promise', async (t) => {
  const base = ['//localhost/', path.join(__dirname, 'fixtures')];
  const filter = () => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        reject(new Error('FINE'));
      }, 1000);
    });
  };

  const error = await t.throwsAsync(
    async () => {
      await resolver.getResource('check.svg', {base, filter});
    },
    {instanceOf: Error}
  );

  t.regex(error.message, /check\.svg.*could not be resolved/);
});
