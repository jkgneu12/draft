'use strict';

var BaseModel = require('../../../../src/scripts/models/base').BaseModel;
var BaseCollection = require('../../../../src/scripts/models/base').BaseCollection;

describe('base model/collection', function () {

    var BASE_URL = 'base/:p1/test/:p2/hello/:p3';

    var emptyParams = {};
    var oneParam = {p1: 'abc'};
    var manyParams = {p1: 'abc', p2: 'efg', p3: 'hij'};

    var emptyParamsUrl = 'base/:p1/test/:p2/hello/:p3';
    var oneParamUrl = 'base/abc/test/:p2/hello/:p3';
    var manyParamsUrl = 'base/abc/test/efg/hello/hij';

    it('model should return properly formatted url if empty params', function () {
        var model = new BaseModel();
        model._baseUrl = BASE_URL;
        model.urlParams = emptyParams;

        expect(model.url()).toBe(emptyParamsUrl);
    });

    it('model should return properly formatted url if one param', function () {
        var model = new BaseModel();
        model._baseUrl = BASE_URL;
        model.urlParams = oneParam;

        expect(model.url()).toBe(oneParamUrl);
    });

    it('model should return properly formatted url if many params', function () {
        var model = new BaseModel();
        model._baseUrl = BASE_URL;
        model.urlParams = manyParams;

        expect(model.url()).toBe(manyParamsUrl);
    });

    it('model should return properly formatted url if many params on collection', function () {
        var model = new BaseModel();
        var collection = new BaseCollection();
        model._baseUrl = BASE_URL;
        model.collection = collection;
        collection.urlParams = manyParams;

        expect(model.url()).toBe(manyParamsUrl);
    });

    it('collection should return properly formatted url if empty params', function () {
        var collection = new BaseCollection();
        collection._baseUrl = BASE_URL;
        collection.urlParams = emptyParams;

        expect(collection.url()).toBe(emptyParamsUrl);
    });

    it('collection should return properly formatted url if one param', function () {
        var collection = new BaseCollection();
        collection._baseUrl = BASE_URL;
        collection.urlParams = oneParam;

        expect(collection.url()).toBe(oneParamUrl);
    });

    it('collection should return properly formatted url if many params', function () {
        var collection = new BaseCollection();
        collection._baseUrl = BASE_URL;
        collection.urlParams = manyParams;

        expect(collection.url()).toBe(manyParamsUrl);
    });
});
