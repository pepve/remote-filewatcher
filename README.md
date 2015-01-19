# Remote Filewatcher

[![Build status](https://img.shields.io/travis/pepve/remote-filewatcher.svg?style=flat-square)](https://travis-ci.org/pepve/remote-filewatcher)

A networked drop-in replacement for [filewatcher](https://github.com/fgnass/filewatcher).

The primary use case for this module is to watch files on NFS and vboxsf mounts inside VirtualBox guests. You run the client in the guest using the same API as the original filewatcher module. And you run the server on the host OS.

Example code for the client:

```js
var remoteFilewatcher = require('remote-filewatcher');

var watcher = remoteFilewatcher();

watcher.add('somefile.txt');

watcher.on('change', function (file) {
    console.log('A file was changed: ' + file);
});

watcher.remove('anotherfile.txt');
```

For the server just run `remote-filewatcher`

License: MIT
