const amqp = require('amqplib'),
    portfinder = require('portfinder'),
    imitationLifetime = require('./imitation'),
    createTorClient = require('./tor'),
    Error = require('./libs/error'),
    Config = require('./libs/config'),
    UserClassFactory = require('./user'),
    request = require('request'),
    [, , configQueue, address = '192.168.33.10', user = 'guest', password = 'guest', port = '5672'] = process.argv;

/*Створюється ланцюг. Кожен запит буде попадати в нього і виконуватись послідовно*/
let chain = Promise.resolve(),
    networkFailsInRow = 0,
    processQueue,
    controlPort,
    socksPort,
    channel,
    config;


portfinder.basePort = 9000;

    Promise.resolve()
        .then(systemInit.bind(null, {user, password, address, port}))
        .then(startTor)
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
        .then(getFreePorts.bind(null, 2))
        .then(ports => {
            socksPort = ports[0];
            controlPort = ports[1];

            return config.get(['tor:hashedPassword']);
        })
        .then( (hashedPassword)  => {
            console.log('Start tor...', controlPort, socksPort);
            return createTorClient({controlPort, socksPort, hashedPassword})
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

    let {user, password, address, port} = options;

    console.log('Join to network...');

    return amqp
        .connect(`amqp://${user}:${password}@${address}:${port}`)
        .then(conn => conn.createChannel())
        .then((ch) => (channel = ch))
        .then(() => {
            config = new Config(channel, configQueue);
            config.on('change', () => {
                restart().catch(errorHandler)
            });
            return config.initialize();
        })
        .then( () => {
            console.log('done');
        })
        .catch(err => { throw new Error(`AMQP connection fails. Actual error: ${err.message}`, 'AmqpError', {stack: err.stack}) });

}

/**
 * Function which subscribe on worker queue and consume new requests
 *
 * @returns {*}
 */

function start() {

    console.log('start consumer...');

    let torPassword, responseQueue, UserClass;

    return config.get(['process:queues:task', 'tor:password', 'service:queues:notify', 'databases:redis:options'])
        .then( response => {

            /*Зберігаю відповідь у змінній, щоб при зміні конфіга, знати застарілу чергу і відключитись від неї*/

            processQueue = response[0];
            torPassword = response[1];
            responseQueue = response[2];

            UserClass = UserClassFactory(response[3]);

            return channel.assertQueue(processQueue);
        })
        .then( q => {
            channel.consume(q.queue, function handleMessage(msg) {
                if(!msg) return;
                const options = JSON.parse(msg.content.toString());
                chain = chain
                    .then( () => {

                        return imitationLifetime(UserClass, options, {controlPort, torPassword, socksPort, address})
                            .then( () => {
                                networkFailsInRow = 0;
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
 * @returns {*}
 */

function stop() {
    return channel.deleteQueue(processQueue)
        .catch( err => { throw new Error(`AMQP connection fails. Actual error: ${err.message}`, 'AmqpError'); })
}

/**
 * Function which fully restarts tor spider
 *
 * @returns {*}
 */

function restart() {
    return stop().then(start)
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
        case 'NetworkError':
            if(++networkFailsInRow <= 5) return err.details.calle(err.details.msg);
            return stop()
                .then(checkConnection)
                .then(start)
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

function getFreePorts(num = 1, ports = []) {
    console.log('start search from', portfinder.basePort);
    if(num < 1) return ports;

    return portfinder.getPortPromise().then( port => {
        portfinder.basePort = port + 1;
        ports.push(port);
        return getFreePorts(num - 1, ports);
    });
}