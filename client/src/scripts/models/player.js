'use strict';

var BaseModel = require('./base').BaseModel;
var BaseCollection = require('./base').BaseCollection;

var Urls = require('../constants/Urls');


var PlayerCore = BaseModel.extend({
    type: 'PlayerCore',
    _baseUrl: Urls.player_cores
});

var Player = BaseModel.extend({
    type: 'Player',
    _baseUrl: Urls.players,
    defaults: {
        core: new PlayerCore(),
        max_starters_points: {},
        max_bench_points: {}
    },
    parse: function(response) {
        response.core = new PlayerCore(response.core);
        response.core.urlParams = this.urlParams || this.collection.urlParams;
        return response
    },
    toJSON: function(options) {
        var ret = this.clone().attributes;
        delete ret['core'];
        return ret;
    }
});

var Players = BaseCollection.extend({
    _baseUrl: Urls.players,

    model: Player,
    parse: function(response){
        return response.players;
    }
});

module.exports.PlayerCore = PlayerCore;
module.exports.Player = Player;
module.exports.Players = Players;
