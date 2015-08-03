'use strict';

var BaseModel = require('./base').BaseModel;
var BaseCollection = require('./base').BaseCollection;

var Urls = require('../constants/Urls');

var Player = require('./player').Player;
var Players = require('./player').Players;
var PlayerCore = require('./player').PlayerCore;


var Roster = BaseModel.extend({
    type: 'Roster',
    _baseUrl: Urls.roster,
    defaults: {
        starters: new Players(),
        bench: new Players()
    },
    parse: function(response) {
        var roster = response.roster;
        if(roster.starters) {
            roster.starters = new Players(response.roster.starters);
            roster.starters.forEach(function(player) {
                player.set('core', new PlayerCore(player.get('core')));
            });
        }
        if(roster.bench) {
            roster.bench = new Players(response.roster.bench);
            roster.bench.forEach(function(player) {
                player.set('core', new PlayerCore(player.get('core')));
            });
        }
        return roster;
    }
});

var Rosters = BaseCollection.extend({
    _baseUrl: Urls.roster,

    model: Roster,
    parse: function(response){
        return response;
    }
});


module.exports.Roster = Roster;
module.exports.Rosters = Rosters;
