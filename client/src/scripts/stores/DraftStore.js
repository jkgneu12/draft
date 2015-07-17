'use strict';

var BaseStore = require('./BaseStore');

var merge = require('merge');

var Draft = require('../models/draft').Draft;
var Drafts = require('../models/draft').Drafts;

var DraftStore = merge(BaseStore, {
    _name: 'DraftStore',
    _modelClass: Draft,
    _collectionClass: Drafts
});

module.exports = DraftStore;
