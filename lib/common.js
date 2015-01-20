var common = module.exports;

common.withCommandEvents = function withCommandEvents (conn) {
	var buffer = '';
	conn.on('data', function (data) {
		buffer += data.toString();

		var index;
		while ((index = buffer.indexOf('\r\n')) !== -1) {
			var line = buffer.substr(0, index);
			buffer = buffer.substr(index + 2);
			var space = line.indexOf(' ');
			var cmd = line.substr(0, space);
			var arg = JSON.parse(line.substr(space + 1));

			conn.emit('command-' + cmd, arg);
		}
	});
};

common.command = function command (conn, cmd, arg) {
	conn.write(cmd + ' ' + JSON.stringify(arg) + '\r\n');
};
