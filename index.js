'use strict';

const debug = require('debug')('asset-resolver');
const resolver = require('./lib/resolver');

function any(promises) {
  return Promise.all(
    promises.map((promise) =>
      promise.then(
        (value) => {
          throw value;
        },
        (error) => error
      )
    )
  ).then(
    (reasons) => {
      throw reasons;
    },
    (error) => error
  );
}

module.exports.getResource = (file, options = {}) => {
  const options_ = {
    base: [process.cwd()],
    filter: () => true,
    ...options
  };

  if (!Array.isArray(options_.base)) {
    options_.base = [options_.base];
  }

  options_.base = resolver.glob([...options_.base]);

  const promises = (options_.base || []).map((base) => {
    return resolver.getResource(base, file, options_);
  });
  return any(promises).catch((error) => {
    const message = [
      `The file "${file}" could not be resolved because of:`
    ].concat(error.map((err) => err.message));
    debug(message);
    return Promise.reject(new Error(message.join('\n')));
  });
};
