/** @jsx React.DOM */

'use strict';

window.React = require('react/addons');
var React = require('react');

window.jQuery = window.$ = require('jquery');

var Router = require('react-router');
var { Route, DefaultRoute } = Router;


var App = require('./handlers/App');
var CreatePage = require('./handlers/CreatePage');
var DraftPage = require('./handlers/DraftPage');

var routes = (
    <Route name="home" path="/" handler={App}>
        <Route name="draft" path="/draft/:draftId" handler={DraftPage} />
        <DefaultRoute handler={CreatePage} />
    </Route>
);

Router.run(routes, function(Root) {
    React.render(<Root/>, document.getElementById('content'));
});

