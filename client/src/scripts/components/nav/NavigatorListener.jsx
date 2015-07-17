/** @jsx React.DOM */

'use strict';

var React = require('react');

var Router = require('react-router');
var Navigation = Router.Navigation;

var NavStore = require('../../stores/NavStore');

var NavigatorListener = React.createClass({
    displayName: 'NavigatorListener',

    mixins: [Navigation],

    getInitialState() {
        return {};
    },
    componentDidMount() {
        NavStore.addNavigateListener(this.nav);
    },
    componentWillUnmount() {
        NavStore.removeNavigateListener(this.nav);
    },
    nav(event){
        this.transitionTo(event.route, event.params);
    },
    render(){
        return <div></div>;
    }
});

module.exports = NavigatorListener;
