'use strict';

var BaseStore = require('./BaseStore');

var assign = require('object-assign');

var RosteredPlayer = require('../models/roster').RosteredPlayer;
var RosteredPlayers = require('../models/roster').RosteredPlayers;

var RosteredPlayerStore = assign({}, BaseStore, {
    _name: 'RosteredPlayerStore',
    _modelClass: RosteredPlayer,
    _collectionClass: RosteredPlayers,

    _value: 0,

    setValue: function(value) {
        this._value = value;
    },
    getValue: function() {
        return this._value;
    }
});
RosteredPlayerStore.setMaxListeners(200);

module.exports = RosteredPlayerStore;
