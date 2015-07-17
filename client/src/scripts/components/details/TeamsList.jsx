/** @jsx React.DOM */

'use strict';

var React = require('react');

var TeamStore = require('../../stores/TeamStore');

var TeamListItem = require('./TeamListItem');

var TeamsList = React.createClass({
    displayName: 'TeamsList',

    getInitialState() {
        return {
            teams: TeamStore.getAll()
        };
    },

    componentDidMount() {
        TeamStore.addChangeAllListener(this.onTeamsChange);
    },
    componentWillUnmount() {
        TeamStore.removeChangeListener(this.onTeamsChange);
    },

    onTeamsChange() {
        this.setState({
            teams: TeamStore.getAll()
        });
    },

    render() {

        var teams = this.state.teams.map(function(team){
           return <TeamListItem team={team} />;
        });

        return (
            <div className="teams-list fill-height">
                {teams}
            </div>
        );
    }
});

module.exports = TeamsList;
