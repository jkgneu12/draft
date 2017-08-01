/*
 * Webpack distribution configuration
 *
 * This file is set up for serving the distribution version. It will be compiled to dist/ by default
 */

var webpack = require('webpack');

module.exports = {

    output: {
        path: 'html/assets/',
        filename: 'main.js'
    },

    debug: false,
    devtool: false,
    entry: './src/scripts/components/main.jsx',

    stats: {
        colors: true,
        reasons: false
    },

    plugins: [
        new webpack.DefinePlugin({
            'process.env':{
                'NODE_ENV': JSON.stringify('production')
            }
        }),
        new webpack.optimize.DedupePlugin(),
        new webpack.optimize.UglifyJsPlugin(),
        new webpack.optimize.OccurenceOrderPlugin(),
        new webpack.optimize.AggressiveMergingPlugin(),
        new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/)
    ],

    resolve: {
        extensions: ['', '.js', '.jsx']
    },

    module: {
        preLoaders: [{
            test: '\\.js$',
            exclude: 'node_modules',
            loader: 'jshint'
        }],
        loaders: [{
            test: /\.(js|jsx)$/,
            exclude: [/(node_modules)/],
            loader: 'babel-loader',
            query : {
                presets: ['react', 'es2015']
            }
        }, {
            test: /\.sass/,
            loader: "style!css!sass?outputStyle=expanded"
        }, {
            test: /\.scss/,
            loader: "style!css!sass"
        }, {
            test: /\.less$/,
            loader: "style-loader!css-loader!less-loader"
        }, {
            test: /\.css$/,
            loader: 'style-loader!css-loader'
        }, {
            test: /\.(png|jpg)$/,
            loader: 'url-loader?limit=8192'
        }, {
            test: /\.(eot|woff|ttf|svg)([\?]?.*)$/,
            loader: "file-loader"
        }]
    }
};
