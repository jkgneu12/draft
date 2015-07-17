'use strict';

var BaseModel = require('./base').BaseModel;
var BaseCollection = require('./base').BaseCollection;

var Urls = require('../constants/Urls');

var Player = BaseModel.extend({
    type: 'Player',
    _baseUrl: Urls.players
});

var Players = BaseCollection.extend({
    _baseUrl: Urls.players,

    model: Player,
    parse: function(response){
        return response.players;
    }
});

module.exports.Player = Player;
module.exports.Players = Players;
