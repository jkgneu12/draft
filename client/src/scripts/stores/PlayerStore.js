'use strict';

var BaseStore = require('./BaseStore');

var assign = require('object-assign');

var Player = require('../models/player').Player;
var Players = require('../models/player').Players;

var PlayerStore = assign({}, BaseStore, {
    _name: 'PlayerStore',
    _modelClass: Player,
    _collectionClass: Players,

    _filter: '',

    setFilter: function(filter) {
        this._filter = filter;
        this.emitChangeFilter();
    },

    getFilter: function(filter) {
        return this._filter;
    },

    emitChangeFilter: function() {
        this.emit(this._name + '_FILTER');
    },

    addChangeFilterListener: function(callback) {
        this.on(this._name + '_FILTER', callback);
    },

    removeFilterListener: function(callback) {
        this.removeListener(this._name + '_FILTER', callback);
    }
});

module.exports = PlayerStore;
