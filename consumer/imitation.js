const cheerio = require("cheerio"),
    {shiftValue, random, getUrlsFromElems} = require("./libs/utils"),
    getStrategies = require('./libs/abyssStrategies'),
    Error = require('./libs/error');

module.exports =  (userClass, options, torOptions) => {

        return Promise.resolve()
            .then(init.bind(null, userClass, options, torOptions))
            .then(user => request(user, options));

};

function init(User, options, torOptions) {

    let currentLocation,
        counterStrategies;

    if(!options.url) throw new Error("Invalid message-config receive: url is undefined", 'MessageError');

    if(options.referer) currentLocation = options.referer[random(0, options.referer.length - 1)];
    counterStrategies = getStrategies(options.counters);

    return User.createUser({currentLocation}, counterStrategies, torOptions)
        .catch(err => {
            throw new Error(`User error: ${err.message}`, 'UserError', {stack: err.stack});
        });

}

function request(user, options, currentDeepLevel=1) {

    let {url, defer=0, deepLinks, target, maxDeepLevel, timeout=5000} = options;

    console.log("Готуюся до запиту. Він станеться через", defer);

    return new Promise( (res) => setTimeout(res, defer))
        .then(user.request.bind(user, url))
        .then(

            res => {

                console.log(`Теперішня глубина запиту ${currentDeepLevel} при максимальній ${maxDeepLevel}`);

                let urls, prom;

                /*Якщо не заданий один з параметрів пошуку ссилок, ябо якщо рівень глубини досяг максимуму з цієї ітерації ланцюга - виходимо*/
                if(!(deepLinks && target && currentDeepLevel < maxDeepLevel)) return;

                /*вибрати ссилки на сайті і зайти на рівень глибше.*/
                urls = getUrlsFromElems(cheerio.load(res.body), target, deepLinks);
                prom = Promise.resolve();
                urls.forEach( childUrl => {
                    let childRequestOptions = Object.assign({}, options, {url: childUrl, defer: shiftValue(timeout)});
                    prom = prom.then(request.bind(null, user, childRequestOptions, currentDeepLevel + 1));
                });
                return prom;

            },

            err => {
                throw currentDeepLevel !== 1?  err :  new Error(`Network error: ${err.message}`, 'NetworkError', {stack: err.stack});
            }

        )

}




