const url = require('url'),
    http = require('http'),
    koa = require('koa'),
    http_proxy = require('http-proxy'),
    logger = require('koa-logger'),
    bodyparser = require('koa-bodyparser'),
    router = require('koa-router')();

module.exports = (events, config) => {

    const proxy = http_proxy.createProxyServer({xfwd: true}),
        app = new koa(),
        serviceConf = config.get('service'),
        staticConf = config.get('static');

    app.use(logger());

    /*Проксі має бути перед бодіпарсером, інакше будуть помилки.*/

    app.use(async (ctx, next) => {
        let server;
        if(ctx.path.match(/^\/sites(\/.*)?$/)){
            server = serviceConf;
            ctx.req.url = ctx.req.url.replace(/^\/sites\/?/, '/');
        } else if(!ctx.path.match(/^\/config(\/.*)?$/)){
            server = staticConf;
        }

        if(server){
            await new Promise( (res, rej) =>  {
                proxy.web(ctx.req, ctx.res, {target: `http://${server.address}:${server.port}`}, err => {
                    if (err) rej(err);
                    res();
                });
            })
        }else {
            await next()
        }

    });

    app.use(bodyparser());

    app.use(async (ctx, next) => {
        try{
            await next();
        } catch(err) {
            if(err.message = "Not Found") {
                ctx.status = 404;
                ctx.body = "Not Found";
            } else {
                ctx.status = 500;
                ctx.body = "Internal Server Error";
            }
        }
    });

    router.get('/config', async (ctx, next) => {
        ctx.body = config.get();
    });

    router.put('/config', async (ctx, next) => {
        let replicate = ctx.request.body;

        recursiveSet(replicate);

        await new Promise( (res, rej) => {
            config.save((err) => {
                if(err) return rej(err);
                config.load(res);
            })
        });

        function recursiveSet(obj, prefix = '') {
            Object.keys(obj).forEach( key => {
                if(typeof obj[key] === 'object' && obj[key] !== null) recursiveSet(obj[key], prefix + key + ':');
                else config.set(prefix + key, obj[key]);
            })
        }

        events.emit('changes');
        ctx.body = config.get();
    });

    app.use(router.routes(), router.allowedMethods());

    app.use(async (ctx, next) => {
        throw new Error('Not Found');
    });

    app.listen(8080, ()=> console.log('config server started successfully'));

};






