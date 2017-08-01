/* global process */
/*
 * Webpack development server configuration
 *
 * This file is set up for serving the webpak-dev-server, which will watch for changes and recompile as required if
 * the subfolder /webpack-dev-server/ is visited. Visiting the root will not automatically reload.
 */

'use strict';
var webpack = require('webpack');

module.exports = {

    output: {
        filename: 'main.js'
    },

    cache: true,
    debug: true,
    devtool: 'source-map',
    entry: [
        'webpack/hot/only-dev-server',
        './src/scripts/components/main.jsx'
    ],

    stats: {
        colors: true,
        reasons: true
    },

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
            loaders: ['react-hot', 'babel-loader?presets[]=react,presets[]=es2015']
        }, {
            test: /\.sass/,
            loader: 'style!css!sass?outputStyle=expanded'
        }, {
            test: /\.scss/,
            loader: 'style!css!sass'
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
            loader: 'file-loader'
        }]
    },

    plugins: [
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoErrorsPlugin(),
        new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/)
    ]

};
