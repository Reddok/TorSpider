const {shiftValue} = require("./libs/utils"),
    day = 24 * 60 * 60 * 1000;

class Spider{

    constructor(config, imitateStrategy){
        this._config = config;
        this._imitate = imitateStrategy;
    }

    start() {
        this._requestsSpan =  Math.round(day / this._config.frequency);
        this._process();
    }

    stop() {
        clearTimeout(this._nextCall);
        this._nextCall = null;
    }

    _process() {
        const defer = shiftValue(this._requestsSpan),
            options = Object.assign({}, this._config); /*щоб не мутатити конфіг павука*/

        this._imitate(options);
        this._nextCall = setTimeout(this._process.bind(this), defer);
        console.log(`До наступного запиту ${defer / 1000} секунд`);
    }

}

module.exports = Spider;