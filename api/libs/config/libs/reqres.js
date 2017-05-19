const uuid = require("node-uuid");

class Reply{
    constructor(queueName, channel) {
        this.queue = queueName;
        this.channel = channel;
    }

    initialize() {
        return this.channel.assertQueue(this.queue);
    }

    registerHandler(handler) {
        return this.channel.consume(this.queue, (msg) => {

            let message = JSON.parse(msg.content.toString()),
            reply = handler(message);

            if(reply && reply.then) reply.then(this._sendBack.bind(this, msg));
            else this._sendBack(msg, reply);

            this.channel.ack(msg);

        });
    }

    _sendBack(msg, reply) {
        this.channel.sendToQueue(msg.properties.replyTo, new Buffer(JSON.stringify(reply)), {correlationId: msg.properties.correlationId});
    }
}

class Request{

    constructor(channel) {
        this.queue = null;
        this.channel = channel;
        this.mapCallbackToReq = {};
    }

    initialize() {
        return this.channel.assertQueue('', {exclusive: true})
            .then((q) => {
            this.queue = q.queue;
        this._listeningToResponse();
    });
    }

    _listeningToResponse() {
        return this.channel.consume(this.queue, (msg) => {

            const message = JSON.parse(msg.content.toString()),
            prom = this.mapCallbackToReq[msg.properties.correlationId];

        if(prom) prom(message);
    }, {noAck: true});
    }

    request(queue, message) {
        return new Promise( (res, rej) => {
                const id = uuid.v4();
        this.mapCallbackToReq[id] = res;
        this.channel.sendToQueue(queue, new Buffer(JSON.stringify(message)), {correlationId: id, replyTo: this.queue});
    } );
    }
}


function ReqResFactory(channel, queueName) {

    const req = new Request(channel),
        res = new Reply(channel, queueName);

    return Promise.all([req.initialize(), res.initialize()]).then(() => ({req, res}));

}

ReqResFactory.Request = Request;
ReqResFactory.Reply = Reply;

module.exports = ReqResFactory;