'use strict';

var BaseStore = require('./BaseStore');

var merge = require('merge');

var Team = require('../models/team').Team;
var Teams = require('../models/team').Teams;

var TeamStore = merge(BaseStore, {
    _name: 'TeamStore',
    _modelClass: Team,
    _collectionClass: Teams
});

module.exports = TeamStore;
