const webpack = require('webpack'),
    webpackHotMiddleware = require('webpack-hot-middleware'),
    webpackDevMiddleware = require('webpack-dev-middleware'),
    express = require('express'),
    config = require('./webpack.config'),
    app = express(),
    port = process.argv[2] || 3000,
    compiler = webpack(config);

app.use(webpackDevMiddleware(compiler, {noInfo: true, publicPath: config.output.publicPath}));
app.use(webpackHotMiddleware(compiler));

app.get('/', (req, res) => {
    if(req.headers['x-forwarded-host']) {
        res.sendFile(__dirname + "/index.html");
    } else {
        res.status(403)
            .send('Forbidden');
    }

});

app.use((req, res) => {
    res
        .status(404)
        .send('Not Found');
});


app.listen(port, (err) => {
    if(err) console.error(err);
    else {
        console.log("Developing server successfully started on port", port);
        process.send && process.send({type: 'Start'});
    }

});