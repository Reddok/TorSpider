const Spider = __dirname + "/spider",
    fork = require('child_process').fork,
    ServiceError = require('./libs/error'),
    timeEmitter = new (require('events').EventEmitter),
    oneDay = 1000 * 60 * 60 * 24;

/*На початку кожного дня обнуляємо всі счетчики для сервісу*/
let currentTime = new Date(),
    startNextDay = new Date();
    startNextDay.setDate(currentTime.getDate() + 1);
    startNextDay.setHours(0, 0, 0, 0);

setTimeout( () => {
    setInterval(timeEmitter.emit.bind(timeEmitter, "start:day"), oneDay);
    timeEmitter.emit("start:day");
}, startNextDay - currentTime);


class Service {

    constructor(db, options) {
        this.db = db;
        this._runningSpiders = {};
        this._messagingOptions = options;
        timeEmitter.on('start:day', this._resetAllCounters.bind(this));
    }

    checkName(name) {
        return this.db.findOne({name: name}).then(model => !!model);
    }

    getSites() {
        return this.db.find({}, {name: 1, isRunning: 1});
    }

    getSite(id) {
        return this.db.findById(id);
    }

    createSite(data) {
        let model = new this.db(data);
        return model.save();
    }

    updateSite(id, data) {
        return this.db.findOneAndUpdate({_id: id}, data).then((res) => {
            if(this._runningSpiders[id]) return this.restartProcess(id).then(() => res);
            else return res;
        });
    }

    deleteSite(id) {
        return this.db.findOneAndRemove({_id: id});
    }

    startProcess(id) {

        return this.db.findById(id).then( siteConfig => {
            if(!siteConfig) throw new ServiceError("This site doesn't exists!");
            if(this._runningSpiders[id]) throw new ServiceError("This spider already run!");

            this._createSpider(id, Object.assign({}, siteConfig._doc, {timeout: siteConfig.timeout * 1000, count: true}));
            siteConfig.isRunning = true;

            console.log(`process with ${id} started successfully`);
            return siteConfig.save();
        });
    }

    stopProcess(id) {

        console.log("i am going to send stop command");

        return new Promise( (res, rej) => {
            let spider = this._runningSpiders[id];

            /*if(!spider) return res(); for production*/
            if(!spider) return this.db.findOneAndUpdate({_id: id}, {isRunning: false}).then(res);

            spider.removeAllListeners();
            spider.once('disconnect', () => this._handleDisconnect(id).then(res).catch(rej));
            spider.send({type: "stop"});
        });

    }

    restartProcess(id) {
        return this.stopProcess(id).then(this.startProcess.bind(this, id));
    }

    increaseRequestsCount(id) {
        console.log("incrementing request count for id", id);

        /*Чомусь без catch дані в бд не обновлялись, не розумію чому...*/
        return this.db.update({_id: id}, {$inc: {requestsForDay: 1}}).catch(err => console.log("updating err", err));
    }

    destroy() {
        let workedSpiders = Object.keys(this._runningSpiders);

        return Promise.all(workedSpiders.map( id => {
            return this.stopProcess(id);
        }))
            .then(
                () => workedSpiders,
                err => { throw ServiceError(`Can't correct shut down service because ${err.message}`); }
            )
    }

    _resetAllCounters() {
        return this.db.updateMany({requestsForDay: {$ne: 0}}, {requestsForDay: 0});
    }

    _handleDisconnect(id) {
        this._runningSpiders[id] = null;
        console.log(`process with ${id} stopped successfully`);
        return this.db.findOneAndUpdate({_id: id}, {isRunning: false});
    }

    _createSpider(id, config) {
        let spider = fork(Spider);
        spider.once('disconnect', this._handleDisconnect.bind(this, id));
        spider.send({type: 'start', data: {config, msgOptions: this._messagingOptions}});

        spider.on("message", msg => {
           switch(msg.type) {
               case "error":
                   console.error(`An error occurred on site ${config.name}`, msg.data);
                   break;
           }
        });

        this._runningSpiders[id] = spider;
    }



}

module.exports = (db, options) => {
    return new Service(db, options);
};


