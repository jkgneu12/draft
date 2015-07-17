'use strict';

var BaseStore = require('./BaseStore');

var merge = require('merge');

var Player = require('../models/player').Player;
var Players = require('../models/player').Players;

var PlayerStore = merge(BaseStore, {
    _name: 'PlayerStore',
    _modelClass: Player,
    _collectionClass: Players
});

module.exports = PlayerStore;
