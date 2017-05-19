const amqp = require('amqplib'),
    serverFactory = require('./server'),
    CreateDb = require('./db'),
    SiteModel = require("./db/models/site"),
    serviceFactory = require("./service"),
    Config = require('./libs/config'),
[, , configQueue,  address = '192.168.33.10', user = 'guest',password = 'guest', port = '5672'] = process.argv;


    let channel, config,
        configRepl,
        db, service,
        server, interruptedSpiders = [];

    amqp
        .connect(`amqp://${user}:${password}@${address}:${port}`)
        .then(conn => conn.createChannel())
        .then(ch => {
            channel = ch;
            config = new Config(channel, configQueue);
            return config.initialize();
        })
        .then(() => {
            config.on('change', () => {
                stopApp.then(createApp);
            });
        })
        .then(createApp)
        .then( () => {
            console.log("started successful");
            process.send({type: 'Start'});
        });

function createApp() {
        return config.get(['service:queues:notify', 'databases:mongo', 'process:queues:task'])
            .then(responses => {
                configRepl = {notifyQueue: responses[0], mongoOptions: responses[1], taskQueue: responses[2]};
                return channel.assertQueue(configRepl.notifyQueue)
            })
            .then(q => {
                db = CreateDb(configRepl.mongoOptions.name, configRepl.mongoOptions.options);
                service = serviceFactory(SiteModel, {user, password, port, address, taskQueue: configRepl.taskQueue}, interruptedSpiders);

                channel.consume(q.queue, msg => {
                    console.log("service receive a message", msg.content.toString());
                    service.increaseRequestsCount(msg.content.toString());
                    channel.ack(msg);
                });

                return Promise.all(interruptedSpiders.map( id => {
                    return service.startProcess(id);
                }));
        })
        .then( () => {
            server = serverFactory(service);
        });
}

function stopApp() {
    return channel.deleteQueue(configRepl.notifyQueue)
        .then(server.shutDown.bind(server))
        .then(service.destroy())
        .then( spiders => interruptedSpiders = spiders)
        .then(db.disconnect.bind(db));
}