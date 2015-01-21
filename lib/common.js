var common = module.exports;

common.withCommandEvents = function withCommandEvents (conn) {
	var buffer = '';
	conn.on('data', function (data) {
		buffer += data.toString();

		var index;
		while ((index = buffer.indexOf('\r\n')) !== -1) {
			var parsed = parse(buffer.substr(0, index));
			buffer = buffer.substr(index + 2);

			conn.emit('command-' + parsed.cmd, parsed.arg);
		}
	});
};

function parse (line) {
	var space = line.indexOf(' ');

	if (space === -1) {
		return {
			cmd: line };
	} else {
		return {
			cmd: line.substr(0, space),
			arg: JSON.parse(line.substr(space + 1)) };
	}
}

common.command = function command (conn, cmd, arg) {
	conn.write(cmd + (arg === undefined ? '' : ' ' + JSON.stringify(arg)) + '\r\n');
};
