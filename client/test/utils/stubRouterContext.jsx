'use strict';

var React = require('react');
var _ = require('lodash');

var stubRouterContext = (Component, props, stubs) => {
    function RouterStub() { }

    _.merge(RouterStub, {
        makePath () {},
        makeHref () {},
        transitionTo () {},
        replaceWith () {},
        goBack () {},
        getCurrentPath () {},
        getCurrentRoutes () {},
        getCurrentPathname () {},
        getCurrentParams () {},
        getCurrentQuery () {},
        isActive () {},
        getRouteAtDepth() {},
        setRouteComponentAtDepth() {}
    }, stubs);

    return React.createClass({
        displayName: 'stubRouterContext',
        childContextTypes: {
            router: React.PropTypes.func,
            routeDepth: React.PropTypes.number
        },

        getChildContext () {
            return {
                router: RouterStub,
                routeDepth: 0
            };
        },

        render () {
            return <Component {...props} />;
        }
    });
};

module.exports = stubRouterContext;
