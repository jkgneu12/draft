/** @jsx React.DOM */

'use strict';

var React = require('react');

var PlayerStore = require('../../stores/PlayerStore');

var Input = require('../form/Input');

var FilterBar = React.createClass({
    displayName: 'FilterBar',

    getInitialState() {
        return {
            filter: PlayerStore.getCurrent().get('core').get('name'),
            players: PlayerStore.getAll(),
            cores: PlayerStore.getAll().map(function(player){return player.get('core')})
        };
    },

       componentDidMount() {
        PlayerStore.addChangeCurrentListener(this.onPlayerChange);
        PlayerStore.addChangeAllListener(this.onPlayersChange);
    },
    componentWillUnmount() {
        PlayerStore.removeChangeListener(this.onPlayerChange);
        PlayerStore.removeChangeListener(this.onPlayersChange);
    },

    onPlayerChange() {
        this.setState({
            filter: PlayerStore.getCurrent().get('core').get('name')
        });
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
