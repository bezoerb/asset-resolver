#!/usr/bin/env node

'use strict';

const meow = require('meow');
const resolver = require('.');

const cli = meow(
  `
Usage
  $ asset-resolver <input>

Options
  -b --base  List of directories/URLs where we should start looking for assets. [Default: process.cwd()]

Examples
  asset-resolver 'my.svg' -b 'some/directory' -b 'http://some.domain/assets'
  <?xml version="1.0" encoding="UTF-8" standalone="no"?>
  <svg>
  ...
  </svg>
`,
  {
    flags: {
      base: {
        type: 'string',
        alias: 'b'
      }
    }
  }
);

resolver
  .getResource(cli.input[0], cli.flags)
  .then((resource) => {
    console.log(resource.contents.toString());
  })
  .catch((error) => {
    console.error(error.message || error);
  });
