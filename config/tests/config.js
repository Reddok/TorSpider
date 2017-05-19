const nconf = require('nconf'),
    path = require('path');

nconf.file({ file: path.join(__dirname, "../config.json") });

console.log(nconf.get());

console.log(nconf.get());