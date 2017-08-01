'use strict';
var React = require('react/addons');
var ReactTestUtils = React.addons.TestUtils;

var stubRouterContext = require('../../../../utils/stubRouterContext');

var App = require('../../../../../src/scripts/components/handlers/App');
var AppWithContext = stubRouterContext(App);

var DummyStore = require('../../../../../src/scripts/stores/DummyStore');

describe('App', function () {

    beforeEach(function () {

    });

    afterEach(function(done) {
        //TODO: cleanup if needed

        setTimeout(done);
    });

    it('should create a new instance of App', function () {

        var app = <AppWithContext test="123"/>;

        ReactTestUtils.renderIntoDocument(app);

    });

    it('should load all dummys when transitioned to', function () {
        spyOn(DummyStore, 'loadAll');

        App.willTransitionTo();

        expect(DummyStore.loadAll).toHaveBeenCalled();
    });
});
