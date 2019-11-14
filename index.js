'use strict';
const defaults = require('lodash.defaults');
const map = require('lodash.map');
const debug = require('debug')('asset-resolver');
const Bluebird = require('bluebird');
const resolver = require('./lib/resolver');

module.exports.getResource = (file, opts) => {
	opts = defaults(opts || {}, {
		base: [process.cwd()],
		filter() {
			return true;
		}
	});

	if (!Array.isArray(opts.base)) {
		opts.base = [opts.base];
	}

	opts.base = resolver.glob([...opts.base]);

	return Bluebird.any(map(opts.base, base => { // eslint-disable-line promise/valid-params
		return resolver.getResource(base, file, opts);
	})).catch(Bluebird.AggregateError, errs => {
		const msg = [`The file "${file}" could not be resolved because of:`].concat(map(errs, 'message'));
		debug(msg);
		return Bluebird.reject(new Error(msg.join('\n')));
	});
};
