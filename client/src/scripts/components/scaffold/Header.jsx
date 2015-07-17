/** @jsx React.DOM */

'use strict';

var React = require('react');

var Header = React.createClass({
    displayName: 'Header',
    render() {
        return (
            <header id="header">
                <span>Ray</span>
            </header>
        );
    }
});

module.exports = Header;
