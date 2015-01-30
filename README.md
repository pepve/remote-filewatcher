# Remote Filewatcher

[![Build status](https://img.shields.io/travis/pepve/remote-filewatcher.svg?style=flat-square)](https://travis-ci.org/pepve/remote-filewatcher)

A networked drop-in replacement for [filewatcher](https://github.com/fgnass/filewatcher).

The primary use case for this module is to watch files on NFS and vboxsf mounts inside VirtualBox guests. You use the client in the guest using the same API as the original filewatcher module. And you run the server on the host OS.

Some example code for the client:

```js
var remoteFilewatcher = require('remote-filewatcher');

var watcher = remoteFilewatcher();

watcher.add('somefile.txt');

watcher.on('change', function (file) {
    console.log('A file was changed: ' + file);
});
```

For the server just run `remote-filewatcher .`, make sure you have this module installed globally.

You can pass a directory to both the client and the server. All files will be communicated between the client and the server relative to these directories. It makes the most sense to set the client directory to the mount point inside the VirtualBox guest and to set the server directory to the exported path on the host OS. Because of the way this is implemented, change events will always have the file's absolute path as the argument, even if the file was added by a relative path.

License: MIT
