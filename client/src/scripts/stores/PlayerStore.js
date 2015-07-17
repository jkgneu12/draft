'use strict';

var BaseStore = require('./BaseStore');

var assign = require('object-assign');

var Player = require('../models/player').Player;
var Players = require('../models/player').Players;

var PlayerStore = assign({}, BaseStore, {
    _name: 'PlayerStore',
    _modelClass: Player,
    _collectionClass: Players
});

module.exports = PlayerStore;
