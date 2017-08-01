'use strict';

module.exports = function (config) {
    config.set({
        basePath: '.',
        frameworks: ['jasmine'],
        files: [
            'node_modules/react-tools/src/test/phantomjs-shims.js',
            'test/unit/spec/**/*.js',
            'test/unit/spec/**/*.jsx'
        ],
        preprocessors: {
            'test/unit/spec/**/*.js': ['webpack'],
            'test/unit/spec/**/*.jsx': ['webpack']
        },
        webpack: {
            cache: true,
            resolve: {
                extensions: ['', '.js', '.jsx']
            },
            module: {
                loaders: [{
                    test: /\.jsx$/,
                    loader: 'jsx-loader?harmony'
                }, {
                    test: /\.sass/,
                    loader: "style!css!sass?outputStyle=expanded"
                }, {
                    test: /\.scss/,
                    loader: "style!css!sass"
                }, {
                    test: /\.css$/,
                    loader: 'style-loader!css-loader'
                }, {
                    test: /\.(png|jpg)$/,
                    loader: 'url-loader?limit=8192'
                }, {
                    test: /\.(eot|woff|ttf|svg)([\?]?.*)$/,
                    loader: "file-loader"
                }],
                postLoaders: [ {
                    test: /\.(js|jsx)$/,
                    exclude: /(test|node_modules|bower_components)\//,
                    loader: 'istanbul-instrumenter'
                } ]
            }
        },
        webpackServer: {
            stats: {
                colors: true
            }
        },
        exclude: [],
        port: 8080,
        logLevel: config.LOG_DEBUG,
        colors: true,
        autoWatch: false,
        // Start these browsers, currently available:
        // - Chrome
        // - ChromeCanary
        // - Firefox
        // - Opera
        // - Safari (only Mac)
        // - PhantomJS
        // - IE (only Windows)
        browsers: ['PhantomJS'],
        reporters: ['progress', 'coverage'],
        coverageReporter: {
            reporters: [
                {type: 'html', dir: 'coverage-html/'},
                {type: 'cobertura', dir: 'coverage-cobertura/'},
                {type: 'text', dir: 'coverage-text/', file: 'coverage.txt'},
                {type: 'text-summary', dir: 'coverage-text/', file: 'coverage-summary.txt'},
            ]

        },
        captureTimeout: 60000,
        singleRun: true
    });
};
