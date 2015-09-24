# asset-resolver [![Build Status](https://travis-ci.org/bezoerb/asset-resolver.svg?branch=master)](https://travis-ci.org/bezoerb/asset-resolver)

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

Type: `string`,`array` 
Default: `[process.cwd()]` 
Required: `false`
Example: `['http://domain.de/', 'http://domain.de/styles', 'app/images']` 

List of directories/urls where we should start looking for assets. 

##### filter

Type: `function` 
Default: `function(){ return true; }` 
Required: `false`
Example: 
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
