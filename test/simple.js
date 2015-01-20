var assert = require('assert'),
	fs = require('fs'),
	child_process = require('child_process'),
	remoteFilewatcher = require('..');

var expectedFile = __dirname + '/foo';
var actualFile;

var server = child_process.spawn('node', [__dirname + '/../lib/server.js', 'localhost', '12345'], { stdio: 'inherit' });

setTimeout(function () {
	var client = remoteFilewatcher({ host: 'localhost', port: '12345' });

	setTimeout(function () {
		fs.writeFileSync(expectedFile, 'a');
		client.add(expectedFile);

		setTimeout(function () {
			fs.writeFileSync(expectedFile, 'b');
		}, 1000);

		client.on('change', function (file) {
			actualFile = file;
		});
	}, 1000);
}, 1000);

setTimeout(function () {
	server.kill();
}, 4000);

process.on('exit', function() {
	fs.unlinkSync(expectedFile);
	assert.equal(actualFile, expectedFile);
	console.log('Simple test OK');
});
