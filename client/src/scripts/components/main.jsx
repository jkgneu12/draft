/** @jsx React.DOM */

'use strict';

window.React = require('react/addons');
var React = require('react');

window.jQuery = window.$ = require('jquery');

var Router = require('react-router');
var { Route, DefaultRoute } = Router;


var App = require('./handlers/App');
var DummyPage = require('./handlers/DummyPage');
var DummysPage = require('./handlers/DummysPage');

var routes = (
    <Route name="home" path="/" handler={App}>
        <Route name="dummy" path="/dummys/:dummyId" handler={DummyPage} />
        <DefaultRoute handler={DummysPage} />
    </Route>
);

Router.run(routes, function(Root) {
    React.render(<Root/>, document.getElementById('content'));
});

