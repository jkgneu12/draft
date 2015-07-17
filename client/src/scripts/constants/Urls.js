'use strict';

var BASE_URL = 'http://127.0.0.1:9000';

var Urls = {
    dummys: '/dummys'
};

Object.keys(Urls).forEach(function(key){Urls[key] = BASE_URL + Urls[key]; });

module.exports = Urls;
