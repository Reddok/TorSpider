const Spider = require('./model'),
    producer = require("./libs/producer");

let spider;

process.on('message', msg => {
    switch(msg.type) {
        case 'start':
            if(spider) return;

            let {config, msgOptions} = msg.data;

            producer(msgOptions)
                .then(strategy => {
                    spider = new Spider(config, strategy);
                    spider.start();
                    console.log("spider started on child process");
                });

            break;
        case 'stop':
            process.disconnect();
            console.log("Child process will stop after end serving current request.");
            spider || spider.stop();
            process.exit();

    }
});

process.on('uncaughtException', errorHandler);

process.on('unhandledRejection', (reason, p) => {
    console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
});


function errorHandler(err) {
    if(err.code === "ECONNREFUSED") return console.error("Помилка!!! Не запущений Tor!");
    process.send({type: "error", data: err});
}
