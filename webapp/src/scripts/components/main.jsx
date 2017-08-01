'use strict';

__webpack_public_path__ = window.location.pathname + 'assets/';

window.React = require('react');
var React = require('react');
var ReactDOM = require('react-dom');

window.jQuery = window.$ = require('jquery');

var RouterLib = require('react-router');
var { Router, Route, IndexRoute, hashHistory } = RouterLib;

var App = require('./handlers/App');
var CreatePage = require('./handlers/CreatePage');
var DraftPage = require('./handlers/DraftPage');


var routes = (
    <Route name="home" path="/" component={App}>
        <IndexRoute component={CreatePage}/>
        <Route name="draft" path="/draft/:draftId" component={DraftPage}/>
    </Route>
);

var router = <Router history={hashHistory}>{routes}</Router>;

ReactDOM.render(router, document.getElementById('content'));

