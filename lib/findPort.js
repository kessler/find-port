var net = require('net')
var async = require('async')
var util = require('util')

module.exports = function(host, start, endOrCallback, callback) {

	if (typeof endOrCallback === 'function') {
		callback = endOrCallback
		endOrCallback = 0
	}

	if (typeof callback !== 'function') {
		throw new Error('missing callback')
	}

	var ports

	if (Array.isArray(start)) {
		ports = start
	} else {
		ports = []
		for (var i = start; i <= endOrCallback; i++) {
			ports.push(i)
		}
	}

	async.filter(ports, probe, callback)

	function probe(port, callback) {

		var server = net.createServer().listen(port, host)

		var calledOnce = false

		var timeoutRef = setTimeout(function() {
			calledOnce = true
			callback(null, false)
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
				callback(null, true)
			}
		})

		server.on('error', function(err) {
			clearTimeout(timeoutRef)

			var result = true
			if (err.code === 'EADDRINUSE' || err.code === 'EACCES') {
				result = false
			}

			if (!calledOnce) {
				calledOnce = true
				callback(null, result)
			}
		})
	}
}
