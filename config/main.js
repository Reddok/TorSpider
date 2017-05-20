const emitter = new (require('events').EventEmitter)(),
    ServerFactory = require('./server'),
    ConfigFactory = require('./config');


let config = ConfigFactory(emitter);
ServerFactory(emitter, config);

process.send && process.send({type: 'Start'});