const {random} = require("../libs/utils"),
    useragent = require("random-useragent"),
    Redis = require('redis')

const listScreens =  [
    {width: 1440, height: 900},
    {width: 1920, height: 1080},
    {width: 800, height: 600},
    {width: 1280, height: 800},
    {width: 1280, height: 1024},
    {width: 1024, height: 768},
    {width: 960, height: 640},
    {width: 1366, height: 768}
];

const listLanguages = [
    "uk,ru;q=0.8,en-US;q=0.5,en;q=0.3",
    "uk,ru;q=0.8,en-US;q=0.5,en;q=0.3",
    "uk,ru;q=0.8,en-US;q=0.5,en;q=0.3",
    "ru,en;q=0.5",
    "ru,en;q=0.5",
    "ru,en;q=0.5",
    "ru,en;q=0.5",
    "ru,en;q=0.5",
    "ru,uk;q=0.7,en;q=0.3",
    "be,ru;q=0.8,uk;q=0.5,en;q=0.3",
    "be,ru;q=0.7,en;q=0.3",
    "ru,be;q=0.7,en;q=0.3",
    "kk,ru;q=0.7,en;q=0.3",
    "az,ru;q=0.7,en;q=0.3"
];

module.exports = (redisOptions) => {

    const redis = Redis.createClient({host: '192.168.33.10', port: 6379}),
        month = 60 * 60 * 24 * 30;



    redis.on('ready', () => {
        console.log("REDIS CONNECTED AND READY TO WORK");
    });

    return (ip) => {

        return new Promise( (res, rej) => {

            redis.get(ip, (err, config) => {

                if(err) return rej(new Error(`Redis replied with error when get user: ${err.message}`));

                /*if(!config) {*/

                    config = {
                        ip,
                        screen: Object.assign({}, listScreens[random(0, listScreens.length - 1)], {colorDepth: 24}),
                        userAgent: useragent.getRandom(),
                        language: listLanguages[random(0, listLanguages.length - 1)]
                    };

                   /* redis.set(ip, JSON.stringify(config), 'EX', month, (err) => {
                        if(err) return rej(new Error(`Redis replied with error when set user: ${err.message}`));*/
                        res(config);
                    /*});*/

                /*} else {
                    res(JSON.parse(config));
                }*/

            });

        });

    };

}

