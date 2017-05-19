const path = require("path"),
    nconf = require("nconf"),
    amqp = require('amqplib'),
    {Reply} = require('./libs/reqres');


module.exports = (events) => {

    nconf.argv().env().file({ file: path.join(__dirname, "config.json") });

    let {address, port, user, password} = nconf.get('amqp'),
        {request} = nconf.get("config:queues"),
        {changes} = nconf.get("config:exchanges"),
        channel, replier;

    amqp.connect(`amqp://${user}:${password}@${address}:${port}`)
        .then(conn => conn.createChannel())
        .then(ch => (channel = ch).assertExchange(changes, "fanout"))
        .then(() => {

            events.on('change', () => channel.publish(changes, 'config:change'));

            replier = new Reply(request, channel);
            return replier.initialize();
        })
        .then(() => {
            replier.registerHandler(configHandler);
            console.log("started successful");
        })
        .catch(err => {
           console.log(`AMQP connection fails. Actual error: ${err.message}`);
        });

    return nconf;

};

function configHandler(request) {

    if(Array.isArray(request)) {
        return request.map(key => nconf.get(key));
    } else if(typeof request === 'object' && request !== null) {
        let response = {};
        Object.keys(request).foreach( key => {
            response[key] = nconf.get(request[key]);
        });
        return response;
    } else {
        return nconf.get(request);
    }

}