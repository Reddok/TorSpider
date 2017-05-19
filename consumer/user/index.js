const tor = require("tor-request"),
    getUserConfig = require('./params'),
    checkIp = 'http://api.ipify.org/';

class User {

    constructor(options, countersStrategies) {
        Object.assign(this, options);
        this.counters = countersStrategies;
    }

    request(url, options = {}) {

        return new Promise((resolve, reject) => {
            options.headers = this._getHeaders(options.headers);
            tor.request(url, options, (err, res, body) => {
                if(err) return reject(err);

                this.currentLocation = url;
                this._abyssCounters(options.headers.referer, options)
                    .then(
                        () => resolve({res, body}),
                        err => reject(err)
                    );
            });
        })

    }

    _getHeaders(headers) {
        return Object.assign({}, {
            "User-Agent": this.userAgent,
            "Accept-Language": this.language,
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
            Connection: "keep-alive",
            referer: this.currentLocation
        }, headers);
    }

    _abyssCounters(referer, options) {
        let requestParams = Object.assign({}, options, {headers: Object.assign({}, options.headers, {referer: this.currentLocation, "Accept-Encoding": "gzip, deflate, sdch"})});

        return Promise.all(this.counters.map( counterFunc => {

            return Promise.resolve()
                .then(counterFunc.bind(null, this.currentLocation, referer, this.screen))  /*Попавши в проміс таким чином функція може бути як синхронною, так і ні, а код для її обробки одинаковий*/
                .then(url => new Promise( resolve => tor.request(url, requestParams, resolve)));

        }));

    }

}

User.createUser = (options, countersStrategies, torOptions) => {
    torOptions && tuneTor(torOptions);
    return generateOptions(options).then( options => new User(options, countersStrategies));
};

module.exports = User;


function generateOptions(options) {
    return new Promise( (res, rej) => tor.newTorSession(err => err && rej(`Cannot obtain new tor session for user: ${err}`) || res() ))
        .then(getIp)
        .then( ip => Object.assign(getUserConfig(ip), options) );
}


function getIp() {
    return new Promise( (resolve, reject) => {
        tor.request(checkIp, {}, (err, res, body) => err && reject(`Cannot check users ip: ${err}`) || resolve(body));
    })
}

function tuneTor(options) {
    tor.TorControlPort.password = options.password;
    tor.TorControlPort.port = options.controlPort;
    tor.setTorAddress(options.address, options.socksPort);
}
