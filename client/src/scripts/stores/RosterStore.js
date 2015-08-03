'use strict';

var BaseStore = require('./BaseStore');

var assign = require('object-assign');

var Roster = require('../models/roster').Roster;
var Rosters = require('../models/roster').Rosters;

var RosterStore = assign({}, BaseStore, {
    _name: 'RosterStore',
    _modelClass: Roster,
    _collectionClass: Rosters,

    _value: 0,

    setValue: function(value) {
        this._value = value;
    },
    getValue: function() {
        return this._value;
    }
});
RosterStore.setMaxListeners(200);

module.exports = RosterStore;
