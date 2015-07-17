/** @jsx React.DOM */

'use strict';

var React = require('react');

var PlayerStore = require('../../stores/PlayerStore');

var Input = require('../form/Input');

var FilterBar = React.createClass({
    displayName: 'FilterBar',

    getInitialState() {
        return {
            filter: '',
            players: PlayerStore.getAll(),
            cores: PlayerStore.getAll().map(function(player){return player.get('core')})
        };
    },

    componentDidMount() {
        PlayerStore.addChangeAllListener(this.onPlayersChange);
    },
    componentWillUnmount() {
        PlayerStore.removeChangeListener(this.onPlayersChange);
    },

    onPlayersChange() {
        this.setState({
            players: PlayerStore.getAll(),
            cores: PlayerStore.getAll().map(function(player){return player.get('core')})
        });
    },

    updateFilter(text) {
        this.setState({
            filter: text
        });
        PlayerStore.setFilter(text);
    },

    render() {

        return (
            <div className="filter-bar">
                <Input value={this.state.filter} onChange={this.updateFilter} autocompletes={this.state.cores} autocompleteKey="name" />
            </div>
        );
    }
});

module.exports = FilterBar;
