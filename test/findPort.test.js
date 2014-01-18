var findPort = require('../lib/findPort.js')
var http = require('http')
var assert = require('assert')

describe('findPort', function () {

	it('throws an error if callback is missing with one argument', function () {
		assert.throws(function () {
			findPort(9000)
		})
	})

	it('throws an error if callback is missing with two arguments', function () {
		assert.throws(function () {
			findPort(9000, 9002)
		})
	})

	it('finds open ports in a range', function (done) {

		var server = http.createServer(function (request, response) {
			response.end()
		})

		server.on('listening', function () {
			findPort(9000, 9003, function(ports) {
				assert.deepEqual(ports, [9001, 9002, 9003])
				server.close()
				done()
			})
		})

		server.listen(9000)

	})

	it('finds open ports in an array', function (done) {

		var server = http.createServer(function (request, response) {
			response.end()
		})

		server.on('listening', function () {
			findPort([9000, 9003], function(ports) {
				assert.deepEqual(ports, [9003])
				server.close()
				done()
			})
		})

		server.listen(9000)

	})
})