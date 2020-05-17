'use strict';
const resolver = require('./lib/resolver');

module.exports.getResource = async (file, options = {}) => {
  const _options = {
    base: [process.cwd()],
    filter: () => true,
    ...options
  };

  if (!Array.isArray(_options.base)) {
    _options.base = [_options.base];
  }

  try {
    const resource = await resolver.getResource(file, _options);
    return resource;
  } catch (error) {
    throw new Error(
      `The file "${file}" could not be resolved because of:\n${error.message}`
    );
  }
};
