[![NPM version][npm-image]][npm-url] [![Build Status][ci-image]][ci-url] [![Coverage Status][coveralls-image]][coveralls-url] [![dependencies Status][depstat-image]][depstat-url] [![devDependencies Status Status][devdepstat-image]][devdepstat-url]

# asset-resolver

> Helper module to find an asset in a set of locations


## Install

```
$ npm install --save asset-resolver
```


## Usage

```js
var resolver = require('asset-resolver');

resolver.getResource('my.svg',{
  base: ['some/directory','http://some.domain/assets']
}).then(function(resource) {
  console.log(resource)
});
//=> { path: http://some.domain/assets/my.svg', mime: 'image/svg+xml', contents: ' ... ' }
```


## API

### resolver(input, [options])

#### input

Type: `string`

The filename

#### options

##### base

* Type: `string`,`array`
* Default: `[process.cwd()]`
* Required: `false`
* Example: `['http://domain.de/', 'http://domain.de/styles', 'app/images', '**/images/']`

List of directories/urls where we should start looking for assets (supports globbing on directories).

##### filter

* Type: `function`
* Default: `function(){ return true; }`
* Required: `false`
* Example:

  ```javascript
  resolver.getResource('my.svg',{
    base: ['some/directory','http://some.domain/assets'],
    filter: function (resource) {
      return filesize(resource) < maxFileSize;
    }
  }).then(function(resource) {
    console.log(resource)
  });
  ```

List of directories/urls where we should start looking for assets.


## CLI

```
$ npm install --global asset-resolver
```

```
$ asset-resolver --help

  Usage
    asset-resolver [input]

  Options
    -b --base  List of directories/urls where we should start looking for assets. [Default: process.cwd()]

  Examples
    $ asset-resolver 'my.svg' -b 'some/directory' -b 'http://some.domain/assets'
    <?xml version="1.0" encoding="UTF-8" standalone="no"?>
    <svg>
    ...
    </svg>
```


## License

MIT © [Ben Zörb](http://sommerlaune.com)


[npm-url]: https://www.npmjs.com/package/asset-resolver
[npm-image]: https://img.shields.io/npm/v/asset-resolver.svg

[ci-url]: https://github.com/bezoerb/asset-resolver/actions?workflow=Tests
[ci-image]: https://github.com/bezoerb/asset-resolver/workflows/Tests/badge.svg

[depstat-url]: https://david-dm.org/bezoerb/asset-resolver
[depstat-image]: https://img.shields.io/david/bezoerb/asset-resolver.svg

[devdepstat-url]: https://david-dm.org/bezoerb/asset-resolver?type=dev
[devdepstat-image]: https://img.shields.io/david/dev/bezoerb/asset-resolver.svg

[coveralls-url]: https://coveralls.io/github/bezoerb/asset-resolver?branch=v1.x
[coveralls-image]: https://img.shields.io/coveralls/github/bezoerb/asset-resolver/v1.x.svg
