'use strict';

var BaseStore = require('./BaseStore');

var merge = require('merge');

var Dummy = require('../models/dummy').Dummy;
var Dummys = require('../models/dummy').Dummys;

var DummyStore = merge(BaseStore, {
    _name: 'DummyStore',
    _modelClass: Dummy,
    _collectionClass: Dummys
});

module.exports = DummyStore;
