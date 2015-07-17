'use strict';

var BaseModel = require('./base').BaseModel;
var BaseCollection = require('./base').BaseCollection;

var Urls = require('../constants/Urls');

var Team = BaseModel.extend({
    type: 'Team',
    _baseUrl: Urls.teams
});

var Teams = BaseCollection.extend({
    _baseUrl: Urls.teams,

    model: Team,
    parse: function(response){
        return response.teams;
    }
});

module.exports.Team = Team;
module.exports.Teams = Teams;
