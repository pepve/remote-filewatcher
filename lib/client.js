var util = require('util'),
	events = require('events'),
	net = require('net'),
	path = require('path'),
	common = require('./common');

module.exports = function (options) {
	return new RemoteWatcher(options);
};

function RemoteWatcher (options) {
	this.host = '10.0.2.2'; // Defaults to VirtualBox host IP
	this.port = '54545';
	this.reconnectDelay = 10000;
	this.filewatcherOptions = {};

	for (var key in options) {
		if (key === 'host' || key === 'port' || key === 'reconnectDelay') {
			this[key] = options[key];
		} else {
			this.filewatcherOptions[key] = options[key];
		}
	}

	this.files = [];
	this.connectLoop();
}

util.inherits(RemoteWatcher, events.EventEmitter);

RemoteWatcher.prototype.connectLoop = function connectLoop () {
	var self = this;

	this.conn = net.createConnection(this.port, this.host);
	this.conn.unref();
	common.withCommandEvents(this.conn);

	common.command(this.conn, 'options', this.filewatcherOptions);

	this.files.forEach(function(file) {
		common.command(self.conn, 'add', file);
	});

	this.conn.on('connect', function() {
		self.emit('connect');
	});

	this.conn.on('command-change', function (file) {
		// Prevent emitting events for unwatched files (which would be a race condition without this check).
		if (self.files.indexOf(file) !== -1) {
			self.emit('change', path.join(process.cwd(), file));
		}
	});

	this.conn.on('command-fallback', function (limit) {
		self.emit('fallback', limit);
	});

	this.conn.on('error', function() {
		// Nothing to do here
	});

	this.conn.on('close', function() {
		self.emit('reconnecting');
		setTimeout(connectLoop.bind(self), self.reconnectDelay).unref();
	});
};

RemoteWatcher.prototype.add = function (file) {
	if (file.indexOf(process.cwd()) !== 0) {
		console.warn('remote-filewatcher: Ignoring file outside of current working directory: ' + file);
	} else {
		var relFile = file.substr(process.cwd().length + 1);
		this.files.push(relFile);
		common.command(this.conn, 'add', relFile);
	}
};

RemoteWatcher.prototype.removeAll = function () {
	this.files = [];
	common.command(this.conn, 'remove-all');
};
