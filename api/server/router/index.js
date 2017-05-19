const router = require("koa-router")();

module.exports = (app, service) => {
    router.get('/', async (ctx) => {
        ctx.body = await service.getSites();
    });

    router.post('/', async (ctx) => {
        let data = ctx.request.body,
            body;
        console.log("data", data);
        body = await service.createSite(data);

        ctx.body = body;
    });

    router.get('/check', async (ctx) => {
        const name = ctx.request.query.name,
            res = await service.checkName(name);
        ctx.body = {exists: res};
    });

    router.get('/:id', async (ctx, next) => {
         const id = ctx.params.id,
             model = await service.getSite(id);
        if(!model) await next();
        ctx.body = model;
    });

    router.put('/:id', async (ctx, next) => {
        let model = await service.updateSite(ctx.params.id, ctx.request.body);
        if(!model) await next();
        else ctx.body = model;
    });

    router.del('/:id', async (ctx, next) => {
        let model = await service.deleteSite(ctx.params.id);
        if(!model) await next();

        ctx.body = {response: "Ok"};
    });

    router.get('/:id/:command', async (ctx, next) => {
        switch(ctx.params.command) {
            case 'start':
                await service.startProcess(ctx.params.id);
                break;
            case 'stop':
                await service.stopProcess(ctx.params.id);
                break;
            default:
                ctx.throw(400, "Unknown command");
        }
        ctx.body = {response: "Ok"};
    });


    /*router.get('/sites/:id/restart', async (ctx, next) => {
        let model = await service.startProcess(ctx.params.id);
        if(!model) await next;

        ctx.body = {response: "Ok"};
    });*/

    app.use(router.routes(), router.allowedMethods());

};