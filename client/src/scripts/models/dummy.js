'use strict';

var BaseModel = require('./base').BaseModel;
var BaseCollection = require('./base').BaseCollection;

var Urls = require('../constants/Urls');

var Dummy = BaseModel.extend({
    type: 'Dummy',
    _baseUrl: Urls.dummys
});

var Dummys = BaseCollection.extend({
    _baseUrl: Urls.dummys,

    model: Dummy,
    parse: function(response){
        return response.dummys;
    }
});

module.exports.Dummy = Dummy;
module.exports.Dummys = Dummys;
