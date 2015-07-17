'use strict';

var BaseStore = require('./BaseStore');

var assign = require('object-assign');

var Draft = require('../models/draft').Draft;
var Drafts = require('../models/draft').Drafts;

var DraftStore = assign({}, BaseStore, {
    _name: 'DraftStore',
    _modelClass: Draft,
    _collectionClass: Drafts
});

module.exports = DraftStore;
