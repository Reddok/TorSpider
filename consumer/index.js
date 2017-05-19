const amqp = require('amqplib'),
    portfinder = require('portfinder'),
    imitationLifetime = require('./imitation'),
    createTorClient = require('./tor'),
    Error = require('./libs/error'),
    Config = require('./libs/config'),
    request = require('request'),
    [, , configQueue, address = '192.168.33.10', torPassword = 'kunk2a', user = 'guest', password = 'guest', port = '5672'] = process.argv;

/*Створюється ланцюг. Кожен запит буде попадати в нього і виконуватись послідовно*/
let chain = Promise.resolve(),
    networkFailsInRow = 0,
    processQueue,
    controlPort,
    socksPort,
    channel;


portfinder.basePort = 9000;

    Promise.resolve()
        .then(startTor)
        .then(systemInit.bind(null, {user, password, address, port}))
        .then(start)
        .then( () => {
            process.send && process.send({type: 'Start'});
        })
        .catch(errorHandler);

/**
 *
 * Function which find free ports and start Tor client for future process
 *
 * @returns {*}
 */

function startTor() {


    return Promise.resolve()
        .then(() => {
            var ports = [];

            return getFreePort()
                .then( port => {
                    ports.push(port);
                    return getFreePort();
                })
                .then( port => {
                    ports.push(port);
                    return ports;
                })

        })
        .then(ports => {
            controlPort = ports[0];
            socksPort = ports[1];

            console.log('Start tor...', ports);
            return createTorClient({controlPort, socksPort})
        })
        .then( torClient => {
            /*Якщо процес Тору помер, то закриваємо всього грабера. Все одно він нічого не може зробити без нього*/
            console.log('done');
            torClient.on('exit', code => errorHandler(new Error(`Tor exited with code ${code}`, 'TorError')));
        })
        .catch(err => {
            console.log("ACTUAL ERROR: ", err);
            throw new Error(err.message, 'TorError');
        });

}

/**
 *
 * Function which connect to message system and create config object
 *
 * @param options object
 * @returns {*}
 */

function systemInit(options) {

    let {user, password, address, port} = options,
        config;

    console.log('Join to network...');

    return amqp
        .connect(`amqp://${user}:${password}@${address}:${port}`)
        .then(conn => conn.createChannel())
        .then((ch) => (channel = ch))
        .then(channel => {
            config = new Config(channel, configQueue);
            config.on('change', () => {
                restart(channel, config).catch(errorHandler)
            });
            return config.initialize();
        })
        .then( config => {
            console.log('done');
            return {config, channel};
        })
        .catch(err => { throw new Error(`AMQP connection fails. Actual error: ${err.message}`, 'AmqpError', {stack: err.stack}) });

}

/**
 * Function which subscribe on worker queue and consume new requests
 *
 * @param options
 * @returns {*}
 */

function start(options) {

    const {channel, config} = options;

    console.log('start consumer...');

    return config.get('process:queues:task')
        .then( response => {

            /*Зберігаю відповідь у змінній, щоб при зміні конфіга, знати застарілу чергу і відключитись від неї*/

            processQueue = response;
            return channel.assertQueue(processQueue);
        })
        .then( q => {
            channel.consume(q.queue, function handleMessage(msg) {
                const options = JSON.parse(msg.content.toString());
                chain = chain
                    .then( () => {

                        return imitationLifetime(options, {controlPort, torPassword, socksPort, address})
                            .then( () => {
                                networkFailsInRow = 0;
                                return config.get('service:queues:notify');
                            })
                            .then( responseQueue => {
                                channel.sendToQueue(responseQueue, new Buffer(options._id));
                                channel.ack(msg);
                            })
                            .catch( err => {
                                err = err.type? err : new Error(`Unexpected consumer error happens: ${err.message}`, 'LifetimeError', {stack: err.stack});
                                err.details = {msg, calle: handleMessage};
                                errorHandler(err);
                            })

                    });
            });

            console.log('done');
        })
        .catch( err => { throw new Error(`AMQP connection fails. Actual error: ${err.message}`, 'AmqpError', {stack: err.stack}) })

}

/**
 * Function which force spider to stop listening worker queue and refuse new requests
 *
 * @param channel
 * @returns {*}
 */

function stop(channel) {
    return channel.deleteQueue(processQueue)
        .catch( err => { throw new Error(`AMQP connection fails. Actual error: ${err.message}`, 'AmqpError'); })
}

/**
 * Function which fully restarts tor spider
 *
 * @param channel
 * @param config
 * @returns {*}
 */

function restart(channel, config) {
    return stop(channel).then(start.bind(null, channel, config))
}


/**
 * Default error handler. Look on type of error and do appropriate action
 *
 * @param err
 * @returns {*}
 */

function errorHandler(err) {

    console.error(err.message);
    console.log(err.stack);

    switch (err.type) {
        case 'FatalError':
        case 'TorError':
        case 'AmqpError':
            console.error('Critical error. Process will exit.');
            return process.exit(1);
        case 'MessageError':
            return channel.noAck(msg);
        case 'MessageWarn':
            return console.warn('Warning: ', err.message);
        case 'UserError':
            return err.details.calle(err.details.msg);
        case 'NetworkError':
            if(networkFailsInRow > 3) return err.details.calle(err.details.msg);
            return stop(channel)
                .then(checkConnection)
                .then(start.bind(null, channel))
                .catch(errorHandler);
    }


    function checkConnection(timeout = 3600) {

        return new Promise((res, rej) => {
            setTimeout(rej.bind(null, new Error("Can't connect to network.", 'FatalError')), timeout * 1000);

            function pingingToSuccess() {
                request('http://google.com', null, (err) => {
                    if (err) return pingingToSuccess();
                    res();

                });
            }

            pingingToSuccess();

        })

    }
}

function getFreePort() {
    console.log('start search from', portfinder.basePort);
    let prom = portfinder.getPortPromise();

    return prom.then( port => {
        portfinder.basePort = port + 1;
        return port;
    });
}