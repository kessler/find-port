var net = require('net')
var async = require('async')
var util = require('util')

module.exports = function(start, endOrCallback, callback) {

	if (arguments.length < 2)
		throw new Error('missing callback')

	if (arguments.length === 2 && typeof endOrCallback !== 'function')
		throw new Error('missing callback')

	if (arguments.length >= 3 && typeof callback !== 'function')
		throw new Error('missing callback')

	if (typeof endOrCallback === 'function') {
		callback = endOrCallback
		endOrCallback = 0
	}

	var ports

	if (util.isArray(start)) {
		ports = start
	} else {

		ports = []

		for (var i = start; i <= endOrCallback; i++)
			ports.push(i)
	}

	async.filter(ports, connect, callback)
}

function connect(port, callback) {

	var socket = net.connect(port)

	var calledOnce = false

	var timeoutRef = setTimeout(function () {
		calledOnce = true
		callback(false)
	}, 2000)

	timeoutRef.unref()

	socket.on('connect', function(socket) {
		clearTimeout(timeoutRef)

		if (socket)
			socket.end()

		if (!calledOnce) {
			calledOnce = true
			callback(false)
		}
	})

	socket.on('error', function(err) {
		clearTimeout(timeoutRef)

		if (socket)
			socket.end();

		var result = true
		if (err.code === 'EADDRINUSE')
			result = false

		if (!calledOnce) {
			calledOnce = true
			callback(result)
		}
	})
}



