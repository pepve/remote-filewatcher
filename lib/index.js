var client = require('./client'),
	server = require('./server'),
	filewatcher = require('filewatcher');

module.exports = function(opts) {
	if (opts.host || opts.port) {
		return client(opts);
	}
	return filewatcher(opts);
};

module.exports.server = server;
