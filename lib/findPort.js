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
		(function() {
			var server = net.createServer();

			var calledOnce = false;

			var timeoutRef = setTimeout(function() {
				if(!!calledOnce)
					return;

				calledOnce = true;
				callback(false);
				server.close();
			},2000);

			server.on('listening', function() {
				clearTimeout(timeoutRef);
				if(!calledOnce) {
					calledOnce = true;
					callback([server.address().port]);
				}

				server.close();
			});

			server.on('error', function(err) {
				clearTimeout(timeoutRef);

				if(!calledOnce) {
					calledOnce = true;
					callback(false);
				}

				server.close();
			});
			server.listen(0, host);
		})();
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
