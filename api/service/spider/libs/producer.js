const amqp = require('amqplib');


module.exports = (options) => {

    let {user, password, address, port, taskQueue} = options,
        connection, channel;

    return amqp.connect(`amqp://${user}:${password}@${address}:${port}`)
        .then(conn => {
            connection = conn;
            return conn.createChannel();
        })
        .then(ch => {
            channel = ch;

            return (msg) => channel.sendToQueue(taskQueue, new Buffer(JSON.stringify(msg)));
        });

};

