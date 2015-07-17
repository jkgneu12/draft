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
    },

    selectPlayer(core) {
        var player = PlayerStore.getAll().findWhere({core_id: core.get('id')});
        PlayerStore.setCurrent(player.get('id'));
    },

    render() {

        return (
            <div className="filter-bar">
                <Input value={this.state.filter}
                       onChange={this.updateFilter}
                       onSelected={this.selectPlayer}
                       autocompletes={this.state.cores}
                       autocompleteKey="name" />
            </div>
        );
    }
});

module.exports = FilterBar;
