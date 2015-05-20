var findPort = require('../lib/findPort.js')
var http = require('http')
var assert = require('assert')

describe('findPort', function () {

	var server;

	beforeEach(function (done) {
		server = http.createServer(function (request, response) {
			response.end()
		})

		server.on('listening', done)

		server.listen(9000)
	})

	afterEach(function() {
		server.close()
	})

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

    it('throws an error if arguments are insane (1)', function () {
        assert.throws(function () {
            findPort(9000, 'string', function() { })
        })
    })


    it('throws an error if arguments are insane (2)', function () {

        assert.throws(function () {
            findPort('string', 4, function() { })
        })

    })





	it('finds unused ports in a range', function (done) {

		findPort(9000, 9003, function(ports) {
			assert.deepEqual(ports, [9001, 9002, 9003])
			done()
		})
	})


    it('find single unused port in a range', function (done) {

        findPort(9000, 9003, true, function(port) {
            assert.equal(port, 9001)
            done()
        })
    })


	it('finds unused ports in an array', function (done) {

		findPort([9000, 9003], function(ports) {
			assert.deepEqual(ports, [9003])
			done()
		})
	})

    it('finds unused ports in an array, when told so using false', function(done) {

        findPort([9000, 9003], false, function(ports) {
            assert.deepEqual(ports, [9003])
            done()
        })
    })

    it('finds single unused port in an array', function (done) {

        findPort([9000, 9003], true, function(port) {
            assert.equal(port, 9003)
            done()
        })

    })





})