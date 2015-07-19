'use strict';

var BaseModel = require('./base').BaseModel;
var BaseCollection = require('./base').BaseCollection;

var Urls = require('../constants/Urls');

var Player = require('./player').Player;
var PlayerCore = require('./player').PlayerCore;

var RosteredPlayer = BaseModel.extend({
    type: 'RosteredPlayer',
    _baseUrl: Urls.rostered_players,
    defaults: {
        core: new Player()
    },
    parse: function(response) {
        if(response.player) {
            response.player.core = new PlayerCore(response.player.core);
        }
        response.player = new Player(response.player);
        return response
    },
    toJSON: function(options) {
        var ret = this.clone().attributes;
        delete ret['player'];
        return ret;
    }
});

var RosteredPlayers = BaseCollection.extend({
    _baseUrl: Urls.rostered_players,

    model: RosteredPlayer,
    parse: function(response){
        return response.rostered_players;
    }
});

module.exports.RosteredPlayer = RosteredPlayer;
module.exports.RosteredPlayers = RosteredPlayers;
