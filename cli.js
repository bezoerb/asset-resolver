#!/usr/bin/env node
'use strict';
const meow = require('meow');
const resolver = require('.');

const cli = meow(
	{
		help: [
			'Usage',
			'asset-resolver [input]',
			'',
			'Options',
			'  -b --base  List of directories/urls where we should start looking for assets. [Default: process.cwd()]',
			'',
			'Examples',
			'$ asset-resolver \'my.svg\' -b \'some/directory\' -b \'http://some.domain/assets\'',
			'<?xml version="1.0" encoding="UTF-8" standalone="no"?>',
			'<svg>',
			'...',
			'</svg>'
		]
	},
	{alias: {b: 'base'}}
);

resolver
	.getResource(cli.input[0], cli.flags)
	.then(resource => {
		console.log(resource.contents);
	})
	.catch(error => {
		console.error(error.message || error);
	});
