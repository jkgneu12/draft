/*global process*/
'use strict';

var connect = require('connect');
var serveStatic = require('serve-static');

var app = connect();

var mountFolder = function (dir) {
    return app.use(serveStatic(require('path').resolve(dir)));
};

var port = 80;
var hostname = '0.0.0.0';

var webpackDistConfig = require('./webpack.dist.config.js'),
    webpackDevConfig = require('./webpack.config.js');

module.exports = function (grunt) {
    // Let *load-grunt-tasks* require everything
    require('load-grunt-tasks')(grunt);

    // Read configuration from package.json
    var pkgConfig = grunt.file.readJSON('package.json');

    grunt.initConfig({
        pkg: pkgConfig,

        env: {
            debug: {
                NODE_ENV: 'development'
            }
        },

        webpack: {
            options: webpackDistConfig,

            dist: {
                cache: false
            }
        },

        'webpack-dev-server': {
            options: {
                host: hostname,
                port: port,
                webpack: webpackDevConfig,
                publicPath: '/assets/',
                contentBase: './<%= pkg.src %>/',
                watchOptions: {
                    poll: 1000 // <-- it's worth setting a timeout to prevent high CPU load
                }
            },

            start: {
                keepAlive: true
            }
        },

        connect: {
            options: {
                port: port
            },

            dist: {
                options: {
                    keepalive: true,
                    middleware: function () {
                        return [
                            mountFolder(pkgConfig.dist)
                        ];
                    }
                }
            }
        },

        open: {
            options: {
                delay: 500
            },
            dev: {
                path: 'http://localhost:<%= connect.options.port %>/'
            },
            dist: {
                path: 'http://localhost:<%= connect.options.port %>/'
            }
        },

        karma: {
            unit: {
                configFile: 'karma.unit.conf.js'
            },
            debug: {
                configFile: 'karma.unit.conf.js',
                options: {
                    browsers: ['PhantomJS_debug'],
                    customLaunchers: {
                        'PhantomJS_debug': {
                            base: 'PhantomJS',
                            options: {
                                windowName: 'my-window',
                                settings: {
                                    webSecurityEnabled: false
                                }
                            },
                            flags: ['--load-images=true'],
                            debug: true
                        }
                    },
                    reporters: ['progress', 'junit'],
                    coverageReporter: {
                    },
                    singleRun: false
                }
            }
        },
        copy: {
            dist: {
                files: [
                    // includes files within path
                    {
                        flatten: true,
                        expand: true,
                        src: ['<%= pkg.src %>/*'],
                        dest: '<%= pkg.dist %>/',
                        filter: 'isFile'
                    },
                    {
                        flatten: true,
                        expand: true,
                        src: ['<%= pkg.src %>/images/*'],
                        dest: '<%= pkg.dist %>/images/'
                    }
                ]
            }
        },

        clean: {
            dist: {
                files: [{
                    dot: true,
                    src: [
                        '<%= pkg.dist %>'
                    ]
                }]
            }
        },

        eslint: {
            options: {
                configFile: 'eslint.json'
            },
            target: ['Gruntfile.js',
                     'src/scripts/components/**/*.jsx',
                     'src/scripts/constants/**/*.js',
                     'src/scripts/models/**/*.js',
                     'src/scripts/stores/**/*.js',
                     'test/**/*.js',
                     'test/**/*.jsx']
        }
    });

    grunt.registerTask('serve', function (target) {
        if (target === 'dist') {
            return grunt.task.run(['build', 'open:dist', 'connect:dist']);
        }

        grunt.task.run([
            'webpack-dev-server'
        ]);
    });

    grunt.registerTask('lint', ['eslint']);
    grunt.registerTask('test', ['karma:unit']);
    grunt.registerTask('debug', ['env:debug', 'karma:debug']);
    grunt.registerTask('build', ['copy', 'webpack']);
    grunt.registerTask('default', []);
};
