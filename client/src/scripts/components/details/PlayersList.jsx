/** @jsx React.DOM */

'use strict';

var React = require('react');

var _ = require('underscore');

var PlayerStore = require('../../stores/PlayerStore');
var TeamStore = require('../../stores/TeamStore');

var Checkbox = require('../form/Checkbox');

var PlayersList = React.createClass({
    displayName: 'PlayersList',

    getInitialState() {
        return {
            player: PlayerStore.getCurrent(),
            players: PlayerStore.getAll(),
            filters: {
                QB: true,
                RB: true,
                WR: true,
                TE: true,
                D: true,
                K: true
            }
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
            player: PlayerStore.getCurrent()
        });
    },

    onPlayersChange() {
        this.setState({
            players: PlayerStore.getAll()
        });
    },

    selectPlayer(player) {
        PlayerStore.setCurrent(player.get('id'));
    },

    toggleFilter(filter, val) {
        this.state.filters[filter] = val;
        this.setState({
            filters: this.state.filters
        });
    },

    render() {
        var self = this;
        var players = this.state.players.filter(function(player){
            return self.state.filters[player.get('core').get('position')];
        }).map(function(player, index){
            var selectPlayer = function(){
                self.selectPlayer(player);
            };
            var cls = '';
            if(player.get('team_id')) {
                cls = 'warning';
            }
            if(self.state.player.get('id') === player.get('id')) {
                cls = 'info';
            }

            var team = TeamStore.getAll().findWhere({id: player.get('team_id')});
            return (
                <tr key={index} className={cls} onClick={selectPlayer}>
                    <td>{team ? team.get('name') : '-'}</td>
                    <td>{player.get('core').get('rank')}</td>
                    <td>{player.get('core').get('position') + player.get('core').get('position_rank')}</td>
                    <td>{player.get('core').get('name')}</td>
                    <td>{player.get('core').get('team_name')}</td>
                    <td>${player.get('core').get('min_price') + "-" + player.get('core').get('target_price') + "-" + player.get('core').get('max_price')}</td>
                </tr>
            );
        });

        var filters = Object.keys(this.state.filters).map(function(filter) {
            var onChange = function(val) {
                self.toggleFilter(filter, val);
            };
            return <span className="filter-checkbox"><Checkbox checked={self.state.filters[filter]} onChange={onChange}/> {filter}</span>;
        });

        return (
            <div className="players-list">
                <div>
                    {filters}
                </div>
                <table className="table table-bordered table-hover">
                    <thead>
                    <th>Owner</th>
                    <th>Rank</th>
                    <th>Position</th>
                    <th>Name</th>
                    <th>Team</th>
                    <th>Price</th>
                    </thead>
                    <tbody>
                    {players}
                    </tbody>
                </table>
            </div>
        );
    }
});

module.exports = PlayersList;
