var net = require('net'),
    async = require('async'),
    util = require('util');

function buildJobFromArguments(args) {

    var assertInt = function(value, argName) {
        return value === parseInt(value, 10) ? value : (function() { throw new Error(argName + ' should be integer')})();
    };

    var range = function(start, end) {
        assertInt(start, 'start');
        assertInt(end, 'end');
        if (end <= start) return [];
        var result = [];
        for (var i = start; i <= end; i++)
            result.push(i)
        return result;
    };

    var callbackAtIndex = function(idx) {
        return typeof args[idx] === 'function' ? args[idx] : (function () {throw new Error('missing callback');})();
    };

    return {
        callback: callbackAtIndex(args.length-1),
        // callback is always last, fail if not

        ports: util.isArray(args[0]) ? args[0] : range(args[0], args[1]),
        // first arg is array, or first pair are ints

        shouldFindFirst: args.length == 4 ? args[2] === true : args.length == 3 ? (args[1] === true) : false
        // === true value, might be second or third argument
    };
}


module.exports = function(start, end, shouldFindFirst, callback) {

    var arrayShuffle = function(o) {
        for (var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x) {
            // see http://stackoverflow.com/questions/6274339/how-can-i-shuffle-an-array-in-javascript
        }
    };

    var job = buildJobFromArguments(arguments);
    var asyncFunc = job.shouldFindFirst ? (arrayShuffle(job.ports), 'detectSeries') : 'filter';
    // we shuffle array, to randomize our chances to find free port
    // as port usage grows, this is still better than search from the beginning
    async[asyncFunc](job.ports, probe, job.callback);
}

function probe(port, callback) {
	var server = net.createServer().listen(port);

	var calledOnce = false;

	var timeoutRef = setTimeout(function () {
		calledOnce = true;
		callback(false);
	}, 2000);

	timeoutRef.unref();

	var connected = false;

	server.on('listening', function() {
		clearTimeout(timeoutRef);

		if (server)
			server.close();

		if (!calledOnce) {
			calledOnce = true;
			callback(true);
		}
	});

	server.on('error', function(err) {
		clearTimeout(timeoutRef);

		var result = true;
		if (err.code === 'EADDRINUSE')
			result = false;

		if (!calledOnce) {
			calledOnce = true;
			callback(result);
		}
	})
}



