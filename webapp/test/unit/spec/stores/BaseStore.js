'use strict';

var Backbone = require('backbone');

var BaseModel = require('../../../../src/scripts/models/base').BaseModel;
var BaseCollection = require('../../../../src/scripts/models/base').BaseCollection;

var BaseStore = require('../../../../src/scripts/stores/BaseStore');

describe('BaseStore', function () {

    beforeEach(function () {
        BaseStore._modelClass = BaseModel;
        BaseStore._collectionClass = BaseCollection;
        BaseStore._currentModel = undefined;
        BaseStore._currentCollection = undefined;
    });

    afterEach(function(done) {
        //TODO: cleanup if needed

        setTimeout(done);
    });

    it('should create an empty model if one doesnt exist on getCurrent', function () {
        var current = BaseStore.getCurrent();

        expect(current instanceof BaseModel).toBe(true);
    });

    it('should return current model if one does exist on getCurrent', function () {
        var current = BaseStore.getCurrent();

        expect(BaseStore.getCurrent()).toBe(current);
    });

    it('should always have a collection connected to a model on getCurrent', function () {
        var current = BaseStore.getCurrent();
        var all = BaseStore.getAll();

        expect(current.collection).toBe(all);
    });

    it('should create an empty collection if one doesnt exist on getAll', function () {
        var current = BaseStore.getAll();

        expect(current instanceof BaseCollection).toBe(true);
    });

    it('should return current collection if one does exist on getAll', function () {
        var current = BaseStore.getAll();

        expect(BaseStore.getAll()).toBe(current);
    });

    it('should return -1 if current does not have an id on getCurrentId', function () {
        var currentId = BaseStore.getCurrentId();

        expect(currentId).toBe(-1);
    });

    it('should return the current id if current does exist on getCurrentId', function () {
        var id = 11;
        BaseStore.getCurrent().attributes.id = id;

        var currentId = BaseStore.getCurrentId();

        expect(currentId).toBe(id);
    });

    it('should clear the current model if id is less than 0 on setCurrent', function () {
        BaseStore.getCurrent();

        expect(BaseStore._currentModel).not.toBeUndefined();

        BaseStore.setCurrent(-1);

        expect(BaseStore._currentModel).toBeUndefined();
    });

    it('should notify once that the current model has changed if id is less than 0 on setCurrent', function () {
        var listener = {
            callback: function() {}
        };
        spyOn(listener, 'callback');

        BaseStore.addChangeCurrentListener(listener.callback);

        BaseStore.setCurrent(-1);

        expect(listener.callback.calls.count()).toEqual(1);
    });

    it('should find a model if id is gte 0 and it exists in the collection on setCurrent', function () {
        BaseStore._modelClass = Backbone.Model.extend({
            fetch: function() {}
        });

        var id = 1;

        var model = new BaseStore._modelClass({id: id});
        BaseStore.getAll().add(model);

        BaseStore.setCurrent(id);

        expect(BaseStore.getCurrent()).toBe(model);
    });

    it('should create a model with urlParams if id is gte 0 on setCurrent', function () {
        BaseStore._modelClass = Backbone.Model.extend({
            fetch: function() {}
        });

        var params = {'test': 123};

        BaseStore.setCurrent(1, params);

        expect(BaseStore.getCurrent().urlParams).toBe(params);
    });

    it('should fetch a model if id is gte 0 on setCurrent', function (done) {
        BaseStore._modelClass = Backbone.Model.extend({
            fetch: function() {
                done();
            }
        });

        BaseStore.setCurrent(1);
    });

    it('should add the new model to the current collection if id is gte than 0 on setCurrent', function (done) {
        var id = 1;

        BaseStore._modelClass = Backbone.Model.extend({
            fetch: function(options) {
                options.success();
                expect(BaseStore.getAll().findWhere({id: id})).toEqual(BaseStore.getCurrent());
                done();
            }
        });

        BaseStore.setCurrent(id);
    });

    it('should notify once that the current collection has changed if id is gte than 0 on setCurrent', function (done) {
        var listener = {
            callback: function() {}
        };
        spyOn(listener, 'callback');

        BaseStore.addChangeAllListener(listener.callback);

        BaseStore._modelClass = Backbone.Model.extend({
            fetch: function(options) {
                options.success();
                expect(listener.callback.calls.count()).toEqual(1);
                done();
            }
        });

        BaseStore.setCurrent(1);
    });

    it('should do nothing if current id is lt 0 on refreshCurrent', function () {
        spyOn(BaseStore.getCurrent(), 'fetch');

        BaseStore.refreshCurrent();

        expect(BaseStore.getCurrent().fetch.calls.count()).toEqual(0);
    });

    it('should fetch the current model if id is gte 0 on refreshCurrent', function (done) {
        BaseStore._modelClass = Backbone.Model.extend({
            fetch: function() {
                done();
            }
        });

        BaseStore.getCurrent().attributes.id = 1;

        BaseStore.refreshCurrent();
    });

    it('should fetch the current collection with options on refreshAll', function (done) {
        var options = {123: 456};
        BaseStore._collectionClass = Backbone.Model.extend({
            fetch: function(opts) {
                expect(opts).toBe(options);
                done();
            }
        });

        BaseStore.refreshAll(options);
    });

    it('should call success if passed in options on refreshAll', function (done) {
        var collection = new BaseCollection();
        var options = {
            success: function() {
                done();
            }
        };

        BaseStore._collectionClass = Backbone.Model.extend({
            fetch: function() {
                options.success(collection);
            }
        });

        BaseStore.refreshAll(options);
    });

    it('should set the current model to the updated model on refreshAll', function (done) {
        var id = 1;
        var collection = new BaseCollection();
        BaseStore._currentModel = new BaseModel({id: id});
        var newModel = new BaseModel({id: id});
        collection.add(newModel);

        BaseStore._collectionClass = Backbone.Model.extend({
            fetch: function(options) {
                options.success(collection);
                expect(BaseStore.getCurrent()).toBe(newModel);
                done();
            }
        });

        BaseStore.refreshAll();
    });

    it('should notify once that the current model model has changed on refreshAll', function (done) {
        var listener = {
            callback: function() {}
        };
        spyOn(listener, 'callback');

        BaseStore.addChangeCurrentListener(listener.callback);

        var collection = new BaseCollection();
        BaseStore._collectionClass = Backbone.Model.extend({
            fetch: function(options) {
                options.success(collection);
                expect(listener.callback.calls.count()).toEqual(1);
                done();
            }
        });

        BaseStore.refreshAll();
    });

    it('should create a new collection with urlParams on loadAll', function () {
        spyOn(BaseStore, 'refreshAll');

        var urlParams = {456: 789};
        BaseStore.loadAll(urlParams);

        expect(BaseStore.getAll().urlParams).toBe(urlParams);
    });

    it('should create a new collection without urlParams on loadAll', function () {
        spyOn(BaseStore, 'refreshAll');

        BaseStore.loadAll();

        expect(BaseStore.getAll().urlParams).toEqual({});
    });

    it('should call refreshAll with options on loadAll', function () {
        spyOn(BaseStore, 'refreshAll');

        var options = {456: 789};
        BaseStore.loadAll({}, options);

        expect(BaseStore.refreshAll).toHaveBeenCalledWith(options);
        expect(BaseStore.refreshAll.calls.count()).toEqual(1);
    });

    it('should create a model with data and urlParams on create', function () {
        BaseStore._modelClass = Backbone.Model.extend({
            save: function() {}
        });

        var data = {abc: 123};
        var params = {zyx: 456};
        BaseStore.create(data, params);

        expect(BaseStore.getCurrent().get('abc')).toBe(123);
        expect(BaseStore.getCurrent().urlParams).toBe(params);
    });

    it('should add the new model to the current collection on create', function (done) {
        var id = 1;
        BaseStore._modelClass = Backbone.Model.extend({
            save: function(data, options) {
                options.success();
                expect(BaseStore.getAll().findWhere({id: id})).toEqual(BaseStore.getCurrent());
                done();
            }
        });

        BaseStore.create({id: id});
    });

    it('should save a model with data on create', function (done) {
        var data = {abc: 123};

        BaseStore._modelClass = Backbone.Model.extend({
            initialize: function(params) {
                expect(params).toBe(data);
            },
            save: function(params) {
                expect(params).toEqual({});
                done();
            }
        });

        BaseStore.create(data);
    });

    it('should notify once that the current model has changed on create', function (done) {
        var listener = {
            callback: function() {}
        };
        spyOn(listener, 'callback');

        BaseStore.addChangeCurrentListener(listener.callback);

        var model = new BaseModel();
        BaseStore._modelClass = Backbone.Model.extend({
            save: function(data, options) {
                options.success(model);
                expect(listener.callback.calls.count()).toEqual(1);
                done();
            }
        });

        BaseStore.create();
    });

    it('should notify once that the current collection has changed on create', function (done) {
        var listener = {
            callback: function() {}
        };
        spyOn(listener, 'callback');

        BaseStore.addChangeAllListener(listener.callback);

        var model = new BaseModel();
        BaseStore._modelClass = Backbone.Model.extend({
            save: function(data, options) {
                options.success(model);
                expect(listener.callback.calls.count()).toEqual(1);
                done();
            }
        });

        BaseStore.create();
    });

    it('should call options.success with the newly created model on create', function (done) {
        var model = new BaseModel();

        var options = {
            success: function(result) {
                expect(result).toBe(model);
                done();
            }
        };

        BaseStore._modelClass = Backbone.Model.extend({
            save: function() {
                options.success(model);
            }
        });

        BaseStore.create({}, {}, options);
    });

    it('should destroy the passed model with options on destroy', function (done) {
        var options = {123: 456};
        BaseStore._modelClass = Backbone.Model.extend({
            destroy: function(opts) {
                expect(opts).toBe(options);
                done();
            }
        });

        var model = new BaseStore._modelClass();

        BaseStore.destroy(model, options);
    });

    it('should destroy the passed model without options if none are passed on destroy', function (done) {
        BaseStore._modelClass = Backbone.Model.extend({
            destroy: function(opts) {
                expect(opts).toEqual({});
                done();
            }
        });

        var model = new BaseStore._modelClass();

        BaseStore.destroy(model);
    });

    it('should set the current model to undefined if ids match on destroy', function () {
        BaseStore._modelClass = Backbone.Model.extend({
            destroy: function() {}
        });

        var id = 1;
        var model = new BaseStore._modelClass({id: id});

        BaseStore._currentModel = new BaseStore._modelClass({id: id});

        BaseStore.destroy(model);

        expect(BaseStore._currentModel).toBeUndefined();
    });

    it('should notify that the current model has changed if ids match on destroy', function () {
        var listener = {
            callback: function() {}
        };
        spyOn(listener, 'callback');

        BaseStore.addChangeCurrentListener(listener.callback);

        BaseStore._modelClass = Backbone.Model.extend({
            destroy: function() {}
        });

        var id = 1;
        var model = new BaseStore._modelClass({id: id});

        BaseStore._currentModel = new BaseStore._modelClass({id: id});

        BaseStore.destroy(model);

        expect(listener.callback.calls.count()).toEqual(1);
    });

    it('should notify only changeCurrent listeners on emitChangeCurrent', function () {
        var currentListener1 = {
            callback: function() {}
        };
        spyOn(currentListener1, 'callback');

        var currentListener2 = {
            callback: function() {}
        };
        spyOn(currentListener2, 'callback');
        var allListener = {
            callback: function() {}
        };
        spyOn(allListener, 'callback');

        BaseStore.addChangeCurrentListener(currentListener1.callback);
        BaseStore.addChangeCurrentListener(currentListener2.callback);
        BaseStore.addChangeAllListener(allListener.callback);
        BaseStore.removeChangeListener(currentListener1.callback);

        BaseStore.emitChangeCurrent();

        expect(currentListener1.callback.calls.count()).toEqual(0);
        expect(currentListener2.callback.calls.count()).toEqual(1);
        expect(allListener.callback.calls.count()).toEqual(0);
    });

    it('should notify only changeAll listeners on emitChangeAll', function () {
        var allListener1 = {
            callback: function() {}
        };
        spyOn(allListener1, 'callback');

        var allListener2 = {
            callback: function() {}
        };
        spyOn(allListener2, 'callback');
        var currentListener = {
            callback: function() {}
        };
        spyOn(currentListener, 'callback');

        BaseStore.addChangeAllListener(allListener1.callback);
        BaseStore.addChangeAllListener(allListener2.callback);
        BaseStore.addChangeCurrentListener(currentListener.callback);
        BaseStore.removeChangeListener(allListener1.callback);

        BaseStore.emitChangeAll();

        expect(allListener1.callback.calls.count()).toEqual(0);
        expect(allListener2.callback.calls.count()).toEqual(1);
        expect(currentListener.callback.calls.count()).toEqual(0);
    });

    it('should notify listeners when the current models attributes change', function () {
        var listener = {
            callback: function() {}
        };
        spyOn(listener, 'callback');

        BaseStore.addChangeCurrentListener(listener.callback);

        BaseStore.getCurrent().set('id', 1);

        expect(listener.callback.calls.count()).toEqual(1);
    });

    it('should notify listeners when the current collection is added to', function () {
        var listener = {
            callback: function() {}
        };
        spyOn(listener, 'callback');

        BaseStore.addChangeAllListener(listener.callback);

        BaseStore.getAll().add(new BaseModel());

        expect(listener.callback.calls.count()).toEqual(1);
    });

    it('should notify listeners when the current collection is sorted', function () {
        var listener = {
            callback: function() {}
        };
        spyOn(listener, 'callback');

        BaseStore.getAll().comparator = 'page';
        BaseStore.getAll().add(new BaseModel({'page': 1}));
        BaseStore.getAll().add(new BaseModel({'page': 2}));

        BaseStore.addChangeAllListener(listener.callback);

        BaseStore.getAll().sort();

        expect(listener.callback.calls.count()).toEqual(1);
    });
});
