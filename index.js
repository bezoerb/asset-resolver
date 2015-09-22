/**
 * Created by ben on 17.09.15.
 */
var resolver = require('./lib/resolver');
var toarray = require('lodash.toarray');
var defaults = require('lodash.defaults');
var map = require('lodash.map');
var debug = require('debug')('asset-resolver');
var Promise = require('bluebird');
var os = require('os');

module.exports.getResource = function (file, opts) {
	opts = defaults(opts || {}, {
		base: [process.cwd()]
	});

	if (typeof opts.base === 'string') {
		opts.base = [opts.base];
	}

	opts.base = toarray(opts.base);

	return Promise.any(map(opts.base, function (base) {
		return resolver.getResource(base, file, opts);
	})).catch(function(err) {
		debug(err.message || err);
		if (!opts.base.length || opts.base[0] === process.cwd()) {
			return Promise.reject('The file "' + file + '" could not be resolved. Try adding base paths.');
		} else {
			return Promise.reject('The file "' + file + '" could not be resolved in:' + os.EOL + ' - ' + opts.base.join(os.EOL + ' - '));
		}
	});
};
