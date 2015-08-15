/** @jsx React.DOM */

'use strict';

var React = require('react');

var Header = React.createClass({
    displayName: 'Header',
    render() {
        return (
            <header id="header">
                <i className='fa fa-diamond'></i>
            </header>
        );
    }
});

module.exports = Header;
