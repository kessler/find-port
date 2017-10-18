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
	} else {
		ports = []
		for (var i = start; i <= endOrCallback; i++) {
			ports.push(i)
		}
	}

	async.map(ports, probe, function(err, results) {
		async.filter(results, isInteger, callback);
	});

	function isInteger(port, cb) {
		cb(Number.isInteger(port) && port > 0);
	};

	function probe(port, callback) {
		var server = net.createServer();

		var calledOnce = false

		var timeoutRef = setTimeout(function() {
			calledOnce = true
			callback(null, false)
		}, 2000)

		timeoutRef.unref()

		var connected = false

		server.on('listening', function() {
			clearTimeout(timeoutRef)

			if (!calledOnce) {
				calledOnce = true;
				if(server.address() == null)
					callback(null, false);
				else
					callback(null, server.address().port)

				server.close();
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
				callback(null, result);
			}
		});

		server.listen(port, host);
	}
}
