'use strict';

var EventEmitter = require('events').EventEmitter;

var assign = require('object-assign');


var NavStore = assign({}, EventEmitter.prototype, {

    addNavigateListener: function(callback) {
        this.on('NAVIGATE', callback);
    },

    emitNavigate: function(route, params) {
        this.emit('NAVIGATE', {route: route, params: params});
    },

    removeNavigateListener: function(callback) {
        this.removeListener('NAVIGATE', callback);
    }


});

module.exports = NavStore;
