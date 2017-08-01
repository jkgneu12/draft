'use strict';

var BaseStore = require('./BaseStore');

var assign = require('object-assign');

var Team = require('../models/team').Team;
var Teams = require('../models/team').Teams;

var TeamStore = assign({}, BaseStore, {
    _name: 'TeamStore',
    _modelClass: Team,
    _collectionClass: Teams
});

module.exports = TeamStore;
