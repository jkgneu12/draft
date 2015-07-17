'use strict';

var BaseModel = require('./base').BaseModel;
var BaseCollection = require('./base').BaseCollection;

var Urls = require('../constants/Urls');

var Draft = BaseModel.extend({
    type: 'Draft',
    _baseUrl: Urls.drafts
});

var Drafts = BaseCollection.extend({
    _baseUrl: Urls.drafts,

    model: Draft,
    parse: function(response){
        return response.drafts;
    }
});

module.exports.Draft = Draft;
module.exports.Drafts = Drafts;
