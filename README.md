# find-port [![Build Status](https://secure.travis-ci.org/kessler/find-port.png?branch=master)](http://travis-ci.org/kessler/find-port)

[![NPM](https://nodei.co/npm/find-port.png)](https://nodei.co/npm/find-port/)
[![NPM](https://nodei.co/npm-dl/find-port.png)](https://nodei.co/npm/find-port/)

find an unused port in your localhost

```js
	var findPort = require('find-port')

	// scan a range
	findPort(8000, 8003, function(ports) {
		console.log(ports)
	})

	// scan explicitly
	findPort([8000, 8011], function(ports) {
		console.log(ports)
	})

	// find first free port in a range
	findPort(8000, 8003, true, function(port) {
    	console.log(port)
    })

    // find first free port in array
    findPort([8000, 8011], true, function(port) {
        console.log(port)
    })

```