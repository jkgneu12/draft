/** @jsx React.DOM */

'use strict';

var React = require('react');

var Router = require('react-router');
var { RouteHandler } = Router;

var Footer = require('../scaffold/Footer');
var Header = require('../scaffold/Header');
var NavigatorListener = require('../nav/NavigatorListener');

var DummyStore = require('../../stores/DummyStore');

/*global window*/
(window !== window.top ? window.top : window).React = React;

// CSS
require('../../../styles/normalize.css');
require('../../../styles/main.scss');


var App = React.createClass({
    displayName: 'App',
    statics: {
        willTransitionTo() {
            DummyStore.loadAll();
        }
    },

    render() {
        return (
            <div className="fill-height">
                <Header/>
                <div id="main-content">
                    <RouteHandler/>
                </div>
                <Footer />
                <NavigatorListener/>
            </div>
        );
    }
});

module.exports = App;
