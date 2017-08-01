'use strict';
var React = require('react/addons');
var ReactTestUtils = React.addons.TestUtils;

var NavigatorListener = require('../../../../../src/scripts/components/nav/NavigatorListener');

var NavStore = require('../../../../../src/scripts/stores/NavStore');

describe('NavigatorListener', function () {


    it('should add listener to NavStore on mount', function () {
        spyOn(NavStore, 'addNavigateListener');

        var nav = <NavigatorListener />;

        ReactTestUtils.renderIntoDocument(nav);

        expect(NavStore.addNavigateListener).toHaveBeenCalled();
    });

    it('should remove listener from NavStore on unmount', function () {
        spyOn(NavStore, 'removeNavigateListener');

        var nav = new NavigatorListener();
        nav.componentWillUnmount();

        expect(NavStore.removeNavigateListener).toHaveBeenCalled();
    });

    it('should call Navigation transitionTo() when nav event sent', function () {
        var event = {
            route: '1',
            params: '2'
        };

        var nav = new NavigatorListener();
        spyOn(nav, 'transitionTo');
        nav.nav(event);

        expect(nav.transitionTo).toHaveBeenCalledWith(event.route, event.params);
    });
});
