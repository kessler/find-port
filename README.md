# find-port [![Build Status](https://secure.travis-ci.org/kessler/find-port.png?branch=master)](http://travis-ci.org/kessler/find-port)

finds an open port

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
```