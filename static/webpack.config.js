
const path = require("path"),
    webpack = require("webpack"),
    DIRPATH = __dirname,
    IMAGEPATH = "/prod/images/[name].[ext]";

module.exports = {
    devtool: 'cheap-module-eval-source-map',
    entry: [
        'webpack-hot-middleware/client',
        'babel-polyfill',
        './dev/js/index.js'
    ],
    output: {
        path: path.join(__dirname, 'prod'),
        filename: 'bundle.js',
        publicPath: '/public'
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoEmitOnErrorsPlugin()
    ],
    resolve: {
        extensions: ['.js', '.json', '.jsx', '.less'],
        alias: {
            "appRoot": DIRPATH + '/dev/js',
            'vendor': "appRoot/vendor"
        }
    },
    module: {
        rules: [
            {
                test: /\.less$/,
                use: ["style-loader", {loader: "css-loader"}, "postcss-loader", "less-loader"]
            },
            {
                test: /\.css$/,
                use: ["style-loader", {loader: "css-loader"}]
            },
            {
                test: /\.(png|jpg)$/,
                use: [{loader: "url-loader", options: {limit: 8192, name: IMAGEPATH}}]
            },
            {
                test: /\.jsx?$/,
                include: [path.resolve(DIRPATH, "dev")],
                exclude: /node_modules/,
                use: ['react-hot-loader', {
                    loader: 'babel-loader',
                    query: {
                        presets: ['es2015', 'react'],
                        plugins: ['transform-object-rest-spread', 'transform-runtime']
                    }
                }]
            },
            /*Підключення шрифтів для бутсрапу*/
            {test: /\.(woff|woff2)(\?v=\d+\.\d+\.\d+)?$/, use: [{loader: 'url-loader', options: {limit: 10000, mimetype: "application/font-woff"}}]},
            {test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/, use: [{loader: 'url-loader', options: {limit: 10000, mimetype: "application/octet-stream"}}]},
            {test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, use: [{loader: 'file-loader'}]},
            {test: /\.svg(\?v=\d+\.\d+\.\d+)?$/, use: [{loader: 'url-loader', options: {limit: 10000, mimetype: "image/svg+xml"}}]}
        ]
    }
};