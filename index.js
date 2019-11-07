'use strict';

const os = require('os');
const debug = require('debug')('asset-resolver');
const resolver = require('./lib/resolver');

function any(promises) {
  return Promise.all(
    promises.map(promise =>
      promise.then(
        val => {
          throw val;
        },
        reason => reason
      )
    )
  ).then(
    reasons => {
      throw reasons;
    },
    firstResolved => firstResolved
  );
}

module.exports.getResource = (file, options = {}) => {
  const opts = {
    base: [process.cwd()],
    filter: () => true,
    ...options
  };

  if (typeof opts.base === 'string') {
    opts.base = [opts.base];
  }

  opts.base = resolver.glob([...opts.base]);

  const promises = (opts.base || []).map(base => {
    return resolver.getResource(base, file, opts);
  });
  return any(promises).catch(error => {
    const msg = [`The file "${file}" could not be resolved because of:`].concat(
      error.map(err => err.message)
    );
    debug(msg);
    return Promise.reject(new Error(msg.join(os.EOL)));
  });
};
