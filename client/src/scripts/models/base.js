'use strict';

var Backbone = require('backbone');

var formatUrl = function formatUrl(urlString, params) {
    Object.keys(params).forEach(function(key) {
        urlString = urlString.replace(':' + key, params[key]);
    });
    return urlString;
};


var BaseModel = Backbone.Model.extend({
    urlRoot: function(){
        return formatUrl(this._baseUrl, this.urlParams || this.collection.urlParams);
    }
});

var BaseCollection = Backbone.Collection.extend({
    url: function(){
        return formatUrl(this._baseUrl, this.urlParams);
    }
});


module.exports.BaseModel = BaseModel;
module.exports.BaseCollection = BaseCollection;
