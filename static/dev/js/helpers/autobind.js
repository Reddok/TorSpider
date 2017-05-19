export default function(ctx, methods) {
    methods.forEach( (method) =>  {

        switch(typeof method) {
            case 'function':
                method = method();
            case 'string':
                if(!ctx[method]) return;
                ctx[method] = ctx[method].bind(ctx);
                break;
            case 'object':
                ctx[method.name] = method.fn.bind(ctx);
                break;
        }

    })
}