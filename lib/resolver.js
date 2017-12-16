'use strict';
const path = require('path');
const url = require('url');
const fs = require('fs-extra');
const request = require('request');
const mime = require('mime');
const Bluebird = require('bluebird');
const debug = require('debug')('asset-resolver');
const result = require('lodash/result');
const reduce = require('lodash/reduce');
const globby = require('globby');

const cache = {};


function isUrl(resource) {
	return /(^\/\/)|(:\/\/)/.test(resource);
}

function handle(filter) {
	return function (resource) {
		debug('handle request', resource.path);
		return Bluebird.resolve(resource)
			.then(filter)
			.then(result => {
				if (!result) {
					debug('FAILED');
					return Bluebird.reject(new Error(resource.path + ' rejected by filter'));
				}
				debug('Passed filter:', resource.path);
				return resource;
			});
	};
}

/**
 * Get external resource
 * @param {string} resource
 * @returns {Promise}
 */
function requestAsync(resource) {
	const settings = {
		followRedirect: true,
		encoding: null
	};
	return new Bluebird((resolve, reject) => {
		// Handle protocol-relative urls
		resource = url.resolve('http://te.st', resource);
		request(resource, settings, (err, resp, body) => {
			let msg;
			if (err) {
				debug('Url failed:', err.message || err);
				return reject(err);
			}
			if (resp.statusCode !== 200) {
				msg = 'Wrong status code ' + resp.statusCode + ' for ' + resource;
				debug(msg);
				return reject(new Error(msg));
			}

			const mimeType = result(resp, 'headers.content-type') || mime.getType(resource);

			resolve({
				contents: body,
				path: resource,
				mime: mimeType
			});
		});
	});
}

/**
 * Get local resource
 * @param {string} resource
 * @returns {Promise}
 */
function readAsync(resource) {
	return fs.readFile(resource).then(body => {
		const mimeType = mime.getType(resource);

		debug('Fetched:', resource);

		return Bluebird.resolve({
			contents: body,
			path: resource,
			mime: mimeType
		});
	});
}

function join(base, file) {
	if (isUrl(file)) {
		return file;
	}
	if (isUrl(base)) {
		if (!/\/$/.test(base)) {
			base += '/';
		}
		return url.resolve(base, file);
	}

	return path.join(base, file);
}

function glob(base) {
	return reduce(base, (res, val) => {
		if (isUrl(val)) {
			res.push(val);
			return res;
		}
		return res.concat(globby.sync([val], {nodir: false}));
	}, []);
}

function getResource(base, file, opts) {
	const resource = join(base, file);
	if (cache[resource]) {
		return cache[resource].then(handle(opts.filter));
	}

	if (isUrl(resource)) {
		cache[resource] = requestAsync(resource, opts);
	} else {
		cache[resource] = readAsync(resource, opts);
	}
	return cache[resource].then(handle(opts.filter));
}

module.exports.getResource = getResource;
module.exports.glob = glob;
