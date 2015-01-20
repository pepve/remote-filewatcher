#!/usr/bin/env node
var net = require('net'),
	filewatcher = require('filewatcher'),
	common = require('./common');

var host = 'localhost';
var port = '54545';

if (process.argv[2]) {
	host = process.argv[2];
}

if (process.argv[3]) {
	port = process.argv[3];
}

var server = net.createServer(function (conn) {
	var watcher;

	common.withCommandEvents(conn);

	conn.on('command-options', function (options) {
		watcher = filewatcher(options);

		watcher.on('change', function (file) {
			common.command(conn, 'change', file);
		});

		watcher.on('fallback', function (limit) {
			common.command(conn, 'fallback', limit);
		});
	});

	conn.on('command-add', function (file) {
		watcher.add(file);
	});

	conn.on('command-remove-all', function () {
		watcher.removeAll();
	});

	conn.on('error', function () {
		// Nothing to do here
	});

	conn.on('close', function () {
		if (watcher) {
			watcher.removeAll();
		}
	});
});

server.listen(port, host);
