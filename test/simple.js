var assert = require('assert'),
	fs = require('fs'),
	child_process = require('child_process'),
	remoteFilewatcher = require('..');

var expectedFile = __dirname + '/foo';
var actualFile;
var unexpectedFile = __dirname + '/bar';
var actualStat;
var changeCount = 0;
var serverRanToEnd;

var server = child_process.spawn('node', [__dirname + '/../lib/server.js', process.cwd(), '12345'], { stdio: 'inherit' });
var serverExited = false;

server.on('exit', function() {
	serverExited = true;
});

setTimeout(function () {
	var client = remoteFilewatcher({ host: 'localhost', port: '12345' });

	setTimeout(function () {
		fs.writeFileSync(expectedFile, 'a');
		fs.writeFileSync(unexpectedFile, 'a');
		client.add(expectedFile);
		client.add(unexpectedFile);
		client.remove(unexpectedFile);

		setTimeout(function () {
			fs.writeFileSync(expectedFile, 'b');
			fs.writeFileSync(unexpectedFile, 'b');
		}, 1000);

		client.on('change', function (file, stat) {
			changeCount++;
			actualFile = file;
			actualStat = stat;

			client.removeAll();
		});
	}, 1000);
}, 1000);

setTimeout(function () {
	serverRanToEnd = !serverExited;
	server.kill();
}, 4000);

process.on('exit', function() {
	fs.unlinkSync(expectedFile);
	fs.unlinkSync(unexpectedFile);
	assert.equal(1, changeCount);
	assert.ok(serverRanToEnd);
	assert.equal(actualFile, expectedFile);
	assert.ok(actualStat);
	console.log('Simple test OK');
});
