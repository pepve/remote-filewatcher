var net = require('net'),
	path = require('path'),
	util = require('util'),
	filewatcher = require('filewatcher'),
	common = require('./common');

module.exports = function(directory, port, address) {

	var server = net.createServer(function (conn) {
		var watcher;

		common.withCommandEvents(conn);

		conn.on('command-options', function (options) {
			watcher = filewatcher(options);

			watcher.on('change', function (file, stat) {
				common.command(conn, 'change', { file: path.relative(directory, file), stat: stat });
			});

			watcher.on('fallback', function (limit) {
				common.command(conn, 'fallback', limit);
			});

			watcher.on('error', function (error) {
				common.command(conn, 'error', util.inspect(error));
			});
		});

		conn.on('command-add', function (file) {
			watcher.add(path.resolve(directory, file));
		});

		conn.on('command-remove', function (file) {
			watcher.remove(path.resolve(directory, file));
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

};