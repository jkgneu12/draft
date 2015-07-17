/** @jsx React.DOM */

'use strict';

var React = require('react');

var TeamListItem = React.createClass({
    displayName: 'TeamListItem',

    getInitialState() {
        return {
            team: this.props.team
        };
    },

    componentWillReceiveProps(nextProps) {
        this.setState({
            team: nextProps.team
        });
    },

    render() {
        return (
            <div className="teams-list-item">
                {this.state.team.get('name')}
            </div>
        );
    }
});

module.exports = TeamListItem;
