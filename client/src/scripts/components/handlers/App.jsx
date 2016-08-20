/** @jsx React.DOM */

'use strict';

var React = require('react');

var Footer = require('../scaffold/Footer');
var Header = require('../scaffold/Header');

/*global window*/
(window !== window.top ? window.top : window).React = React;

// CSS
require('../../../styles/normalize.css');
require('../../../styles/main.scss'); 


var App = React.createClass({
    displayName: 'App',

    render() {
        return (
            <div className="fill-height">
                <Header/>
                <div id="main-content">
                    {this.props.children}
                </div>
                <Footer />
            </div>
        );
    }
});

module.exports = App;
