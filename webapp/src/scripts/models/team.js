'use strict';

var BaseModel = require('./base').BaseModel;
var BaseCollection = require('./base').BaseCollection;

var Player = require('./player').Player;
var Players = require('./player').Players;
var PlayerCore = require('./player').PlayerCore;

var Urls = require('../constants/Urls');

var Team = BaseModel.extend({
    type: 'Team',
    _baseUrl: Urls.teams,
    defaults: {
        starters: new Players(),
        bench: new Players(),
        points: 0
    },
    parse: function(response) {
        if(response.starters) {
            response.starters = new Players(response.starters);
            response.starters.forEach(function(player) {
                player.set('core', new PlayerCore(player.get('core')));
            });
        }
        if(response.bench) {
            response.bench = new Players(response.bench);
            response.bench.forEach(function(player) {
                player.set('core', new PlayerCore(player.get('core')));
            });
        }
        return response;
    }
});

var Teams = BaseCollection.extend({
    _baseUrl: Urls.teams,

    model: Team,
    parse: function(response){
        return response.teams;
    },

    comparator: 'order'
});

module.exports.Team = Team;
module.exports.Teams = Teams;
