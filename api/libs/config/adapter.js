const Emitter = require('events').EventEmitter,
    {Request} = require('./libs/reqres'),
    diff = require('deep-diff');


class Config extends Emitter {
    constructor(channel, configQueue = 'config_request_queue') {
        super();
        this._channel = channel;
        this._notifyQueue = null;
        this._configExchange = null;
        this._requestQueue = configQueue;

        this._config = {};
    }

    initialize() {

        return this.get('config:exchanges:changes')
            .then( exchangeName => {
                this._configExchange = exchangeName;
                return this._channel.assertQueue(null, {exclusive: true})
            })
            .then( q => {
                this._notifyQueue = q.queue;
                return this._channel.bindQueue(this._notifyQueue, this._configExchange);
            })
            .then( () => {
                this._channel.consume(this._notifyQueue, () => {
                    let initialConfig = this._config;
                    this.load().then( ()=> {
                        diff(this._config, initialConfig) && this.emit('config:change');
                    });
                });
                return this;
            })
    }

    get(keys = []) {

        Array.isArray(keys) || (keys = [keys]);
        let undefinedKeys = keys.filter(key => typeof this._config[key] === "undefined");

        return Promise.resolve()
            .then( () => {
                if(undefinedKeys.length) {
                    return this._request(undefinedKeys)
                        .then(response => {
                            undefinedKeys.forEach( (key, i) => this._config[key] = response[i] );
                        })
                }
            })
            .then( () => keys.length > 1? keys.map( key => this._config[key] ) : this._config[keys[0]])

    }

    load() {
        let keys = Object.keys(this._config);

        return this._request(keys)
            .then(responses => {
                this._config = keys.reduce((cont, key, i) => {
                    cont[key] = responses[i];
                    return cont;
                } ,{});
            })
    }

    _request(key) {
        let respProm = Promise.resolve();

        if(typeof this._requester === "undefined"){
            this._requester = new Request(this._channel);
            respProm = respProm.then( () =>  this._requester.initialize());
        }

        return respProm.then(() => this._requester.request(this._requestQueue, key));

    }
}

module.exports = Config;