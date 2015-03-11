var util = require('util'),
	events = require('events'),
	net = require('net'),
	path = require('path'),
	common = require('./common');

module.exports = function (options) {
	return new RemoteWatcher(options);
};

function RemoteWatcher (options) {
	this.directory = process.cwd();
	this.host = '10.0.2.2'; // Defaults to VirtualBox host IP
	this.port = '54545';
	this.reconnectDelay = 10000;
	this.persistent = true;
	this.filewatcherOptions = {};

	for (var key in options) {
		if (key === 'directory' || key === 'host' || key === 'port' || key === 'reconnectDelay' || key === 'persistent') {
			if (options[key] !== undefined && options[key] !== null) {
				this[key] = options[key];
			}
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
	common.withCommandEvents(this.conn);

	if (!this.persistent) {
		this.conn.unref();
	}

	common.command(this.conn, 'options', this.filewatcherOptions);

	this.files.forEach(function(file) {
		common.command(self.conn, 'add', file);
	});

	this.conn.on('connect', function() {
		self.emit('connect', self.host, self.port);
	});

	this.conn.on('command-change', function (info) {
		// Prevent emitting events for unwatched files (which would be a race condition without this check).
		if (self.files.indexOf(info.file) !== -1) {
			self.emit('change', path.resolve(self.directory, info.file), info.stat);
		}
	});

	this.conn.on('command-fallback', function (limit) {
		self.emit('fallback', limit);
	});

	this.conn.on('command-error', function (error) {
		self.emit('error', error);
	});

	this.conn.on('error', function() {
		// Nothing to do here
	});

	this.conn.on('close', function() {
		self.emit('disconnect', self.host, self.port, self.reconnectDelay);

		var timer = setTimeout(connectLoop.bind(self), self.reconnectDelay);

		if (!self.persistent) {
			timer.unref();
		}
	});
};

RemoteWatcher.prototype.add = function (file) {
	var relFile = path.relative(this.directory, file);
	this.files.push(relFile);
	common.command(this.conn, 'add', relFile);
};

RemoteWatcher.prototype.list = function () {
	return this.files.slice();
};

RemoteWatcher.prototype.remove = function (file) {
	var relFile = path.relative(this.directory, file);
	var index = this.files.indexOf(relFile);
	if (index !== -1) {
		this.files.splice(index, 1);
		common.command(this.conn, 'remove', relFile);
	}
};

RemoteWatcher.prototype.removeAll = function () {
	this.files = [];
	common.command(this.conn, 'remove-all');
};
