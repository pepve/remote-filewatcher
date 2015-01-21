#!/usr/bin/env node
var net = require('net'),
	path = require('path'),
	filewatcher = require('filewatcher'),
	common = require('./common');

var directory;
var port = '54545';
var address = '127.0.0.1';

if (!process.argv[2]) {
	console.error('Usage: remote-filewatcher <directory> [<listen-port> [<listen-address>]]');
	process.exit(1);
}

directory = process.argv[2];

if (process.argv[3]) {
	port = process.argv[3];
}

if (process.argv[4]) {
	address = process.argv[4];
}

var server = net.createServer(function (conn) {
	var watcher;

	common.withCommandEvents(conn);

	conn.on('command-options', function (options) {
		watcher = filewatcher(options);

		watcher.on('change', function (file) {
			common.command(conn, 'change', path.relative(directory, file));
		});

		watcher.on('fallback', function (limit) {
			common.command(conn, 'fallback', limit);
		});
	});

	conn.on('command-add', function (file) {
		watcher.add(path.resolve(directory, file));
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

server.listen(port, address);
