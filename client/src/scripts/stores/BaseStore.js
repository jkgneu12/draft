'use strict';

var EventEmitter = require('events').EventEmitter;

var merge = require('merge');

var _ = require('underscore');


var BaseStore = merge(EventEmitter.prototype, {

    _modelClass: undefined,
    _collectionClass: undefined,

    _currentModel: undefined,
    _currentCollection: undefined,

    getCurrent: function() {
        if(this._currentModel === undefined) {
            this._currentModel = this._createModel({}, {});
        }
        return this._currentModel;
    },

    getAll: function() {
        if(this._currentCollection === undefined) {
            this._currentCollection = this._createCollection([], {});
        }
        return this._currentCollection;
    },

    getCurrentId: function() {
        var ret = this.getCurrent().get('id') || -1;
        return parseInt(ret);
    },

    setCurrent: function(id, urlParams) {
        if(id > 0) {
            this._currentModel = this.getAll().findWhere({id: id});
            if(this._currentModel === undefined) {
                this._currentModel = this._createModel({id: id}, urlParams);
                var self = this;
                this._currentModel.fetch({
                    success: function(){
                        self.getAll().add(self._currentModel);
                    }
                });
            }
        } else {
            this._currentModel = undefined;
            this.emitChangeCurrent();
        }
    },

    refreshCurrent: function(options) {
        if(this.getCurrentId() >= 0) {
            this.getCurrent().fetch(options);
        }
    },

    refreshAll: function(options) {
        var self = this;
        options = options || {};
        var _success = options.success;
        options.success = function(collection) {
            self._currentModel = collection.findWhere({id: self.getCurrentId()});
            self.emitChangeCurrent();
            if(_success) {
                _success(collection);
            }
        };
        this.getAll().fetch(options);
    },

    loadAll: function(urlParams, options) {
        this._currentCollection = this._createCollection([], urlParams);
        this.refreshAll(options);
    },

    create: function(data, urlParams, options) {
        options = options || {};
        var self = this;
        this._currentModel = this._createModel(data, urlParams);
        this._currentModel.save({}, {
            success: function(model){
                self._currentCollection.add(self._currentModel);
                self.emitChangeCurrent();
                if(options.success) {
                    options.success(model);
                }
            }
        });
    },

    destroy: function(model, options) {
        options = options || {};
        if(model.get('id') === this.getCurrentId()) {
            this._currentModel = undefined;
            this.emitChangeCurrent();
        }
        model.destroy(options);
    },

    emitChangeAll: function() {
        this.emit(this._name + '_ALL');
    },

    addChangeAllListener: function(callback) {
        this.on(this._name + '_ALL', callback);
    },

    emitChangeCurrent: function() {
        this.emit(this._name + '_CURRENT');
    },

    addChangeCurrentListener: function(callback) {
        this.on(this._name + '_CURRENT', callback);
    },

    removeChangeListener: function(callback) {
        this.removeListener(this._name + '_ALL', callback);
        this.removeListener(this._name + '_CURRENT', callback);
    },

    _createCollection: function(models, urlParams) {
        var collection = new this._collectionClass(models);
        collection.urlParams = urlParams || {};

        var self = this;
        collection.on('add remove sort', function(){
            self.emitChangeAll();
        });
        return collection;
    },

    _createModel: function(data, urlParams) {
        var model = new this._modelClass(data);
        model.collection = this.getAll();
        model.urlParams = _.extend(urlParams, this.getAll().urlParams);

        var self = this;
        model.on('change', function(){
            self.emitChangeCurrent();
        });

        return model;
    }
});

module.exports = BaseStore;
