"use strict";

const os = require("os");
const debug = require("debug")("asset-resolver");
const Bluebird = require("bluebird");
const resolver = require("./lib/resolver");

module.exports.getResource = function(file, options = {}) {
	const opts = {
		base: [process.cwd()],
		filter: () => true,
		...options
	};

	if (typeof opts.base === "string") {
		opts.base = [opts.base];
	}

	opts.base = resolver.glob([...opts.base]);

	const promises = (opts.base || []).map(base => {
		return resolver.getResource(base, file, opts);
	});
	return Bluebird.any(promises).catch(Bluebird.AggregateError, errs => {
		const msg = [
			'The file "' + file + '" could not be resolved because of:'
		].concat(errs.map(err => err.message));
		debug(msg);
		return Bluebird.reject(new Error(msg.join(os.EOL)));
	});
};
