'use strict';
const os = require('os');
const toarray = require('lodash/toArray');
const defaults = require('lodash/defaults');
const map = require('lodash/map');
const debug = require('debug')('asset-resolver');
const Bluebird = require('bluebird');
const resolver = require('./lib/resolver');

module.exports.getResource = function (file, opts) {
	opts = defaults(opts || {}, {
		base: [process.cwd()],
		filter() {
			return true;
		}
	});

	if (typeof opts.base === 'string') {
		opts.base = [opts.base];
	}

	opts.base = resolver.glob(toarray(opts.base));

	return Bluebird.any(map(opts.base, base => { // eslint-disable-line promise/valid-params
		return resolver.getResource(base, file, opts);
	})).catch(Bluebird.AggregateError, errs => {
		const msg = ['The file "' + file + '" could not be resolved because of:'].concat(map(errs, 'message'));
		debug(msg);
		return Bluebird.reject(new Error(msg.join(os.EOL)));
	});
};
