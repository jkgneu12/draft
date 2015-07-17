/** @jsx React.DOM */

'use strict';

var React = require('react');

var Footer = React.createClass({
    displayName: 'Footer',
    render() {
        return (
            <footer id="footer">
            @ 2015 Nuance Communications Inc.
            </footer>
        );
    }

});

module.exports = Footer;
