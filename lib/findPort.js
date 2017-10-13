var net = require('net')
var async = require('async')
var util = require('util')

module.exports = function(host, start, endOrCallback, callback) {

	if (typeof start == 'function') {
		callback = start;
		start = 0;
		endOrCallback = 0;
	}

	if (typeof endOrCallback === 'function') {
		callback = endOrCallback
		endOrCallback = 0
	}

	if (typeof callback !== 'function') {
		throw new Error('missing callback')
	}

	var ports

	if (util.isArray(start)) {
		ports = start
	} else if(start > 0) {
		ports = []
		for (var i = start; i <= endOrCallback; i++) {
			ports.push(i)
		}
	}

	if (typeof ports != 'undefined' && ports.length > 0) {
		async.filter(ports, probe, callback);
	} else {
		(new Promise(function(resolve, reject) {
			var server = net.createServer();
			var timeoutRef = setTimeout(reject.bind(null, []), 2000);
			server.on('listening', function() {
				clearTimeout(timeoutRef);
				resolve([server.address().port]);
				server.close();
			});
			server.on('error', function(err) {
				clearTimeout(timeoutRef);
				reject([])
				server.close();
			});
			server.listen(0, host);
		})).then(callback).catch(callback);
	}

	function probe(port, callback) {

		var server = net.createServer().listen(port, host)

		var calledOnce = false

		var timeoutRef = setTimeout(function() {
			calledOnce = true
			callback(false)
		}, 2000)

		timeoutRef.unref()

		var connected = false

		server.on('listening', function() {
			clearTimeout(timeoutRef)

			if (server) {
				server.close()
			}

			if (!calledOnce) {
				calledOnce = true
				callback(true)
			}
		})

		server.on('error', function(err) {
			clearTimeout(timeoutRef)

			var result = true
			if (err.code === 'EADDRINUSE') {
				result = false
			}

			if (!calledOnce) {
				calledOnce = true
				callback(result)
			}
		})
	}
}
