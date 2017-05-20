let fork = require('child_process').fork,
    [, , numberOfConsumers = 1] = process.argv,
    mkdirp = require('mkdirp'),
    fs = require('fs'),
    through = require('through2'),
    formatDate = require('./libs/date'),
    children = [];

    Promise.resolve()
        .then(startConfig)
        .then(startApi)
        .then(startStatic)
        .then( () => {
            let prom = Promise.resolve();
            for(;numberOfConsumers, numberOfConsumers--;) prom = prom.then(startConsumer.bind(null, numberOfConsumers));
            return prom;
        } )
        .then( () => {
            console.log('All started successfully');
        })
        .catch( err => {
            console.log('Launching failed. Error: ', err);
        });


function startApi() {
    return startService('main.js', 'api', ['config_request_queue', '192.168.33.10'], {cwd: './api'});
}

function startConfig() {
    return startService('main.js', 'config', [], {cwd: './config'});
}

function startStatic() {
    return startService('server.js', 'static', [], {cwd: './static'});
}

function startConsumer(id) {
    return startService('index.js', 'consumer' + id, ['config_request_queue', '192.168.33.10'], {cwd: './consumer'});
}

function addTimestamp() {
    var tail = '';
    return through( function(chunk, enc, cb) {

        var date = '[' + formatDate() +'] ',
            data;

        data = tail + chunk.toString();

        data = data.split(/\r?\n/);
        tail = data.pop();

        data.forEach(str => {
            this.push(date + str + '\r\n');
        });

        cb();
    })
}

function startService(path, name, args = [], options = {}) {
    return new Promise( (res, rej) => {

        const child = fork( path, args, Object.assign({}, {silent: true}, options) ),
            dirpath = 'logs/' + name;

        child.name = name;
        children.push(child);

        child.once('message', data => {
            if(data.type === 'Start') {
                console.log(name + ' starting successfully');
                res();
            }
        });

        child.once('exit', () => {
            const message = child.name + ' exited. For more information, if any, see logs.';
            rej(message);
            console.log(message);
        });

        mkdirp(dirpath, () => {
            child.stdout.pipe(addTimestamp()).pipe(fs.createWriteStream(dirpath + '/logs' + '.log', {flags: 'a'}));
            child.stderr.pipe(addTimestamp()).pipe(fs.createWriteStream(dirpath + '/error' + '.log', {flags: 'a'}));
        });


    } );
}

