const koa = require('koa'),
    http = require('http'),
    http_logger = require('koa-logger'),
    parser = require('koa-bodyparser'),
    cors = require('koa-cors');

module.exports = (service, port = 8000) => {

    let app = new koa(),
        server;

    app.use(async (ctx, next) => {
        /*Нажаль модуль був розрахований на використання генераторів. Мені не хотілось ради 1 модуля качати co, тому тут
         * невелика обгортка саме для цього модуля.*/
        let middleware = cors().bind(ctx, next)(),
            returned = {};

        while(!returned.done) {
            returned = middleware.next(returned.value);
            if(typeof returned.value === "function") returned.value = await returned.value();
        }

    });

    app.use(parser({
        onerror: (err) => {
            console.log('Parsing error', err);
        }
    }));
    app.use(http_logger());

    app.use(async (ctx, next) => {
        try{
            console.log("In main stream");
            await next();
        }catch(err) {
            console.error("server error", err);
            if(err.name === "ValidationError" || err.name === "ServiceError") {
                err.status = 400;
                err.message = "Bad Request";
            }

            if(err.status && err.status < 500) {
                ctx.status = err.status;
                ctx.body = err.message;
            } else {
                server.shutDown();
                try{
                    ctx.status = 500;
                    ctx.body = 'Internal server error. Try again later';
                }catch(err) {
                    console.log('error', 'Unable to send error, because ', err);
                }
            }
        }
    });

    /*Підключення роутера, пропускаючи через нього апп*/
    require("./router")(app, service);

    app.use( ctx => ctx.throw(404, "Not Found"));
    server = app.listen(port, () => console.log(`Server running on port ${port}.`));

    server.shutDown = () => {
      return new Promise( (res, rej) => {
          let worker = require('cluster').worker;
          if(worker) worker.disconnect();
          this.close( err => {
              if(err) return rej(err);
              res();
          });
      });
    };

    return server;
};



