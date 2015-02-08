var client = require('./client'),
	filewatcher = require('filewatcher');

module.exports = function(opts) {
	if (opts.host || opts.port) {
		return client(opts);
	}
	return filewatcher(opts);
};
