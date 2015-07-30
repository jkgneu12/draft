/** @jsx React.DOM */

'use strict';

var React = require('react');

var _ = require('underscore');

var PlayerStore = require('../../stores/PlayerStore');
var TeamStore = require('../../stores/TeamStore');
var RosteredPlayerStore = require('../../stores/RosteredPlayerStore');

var RosteredPlayer = require('../../models/roster').RosteredPlayer;

var Checkbox = require('../form/Checkbox');

var PlayersList = React.createClass({
    displayName: 'PlayersList',

    getInitialState() {
        return {
            player: PlayerStore.getCurrent(),
            players: PlayerStore.getAll(),
            positions: RosteredPlayerStore.getAll(),
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
        RosteredPlayerStore.addChangeAllListener(this.onPositionsChange);
    },
    componentWillUnmount() {
        PlayerStore.removeChangeListener(this.onPlayerChange);
        PlayerStore.removeChangeListener(this.onPlayersChange);
        RosteredPlayerStore.removeChangeListener(this.onPositionsChange);
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

    onPositionsChange() {
        this.setState({
            positions: RosteredPlayerStore.getAll()
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
        }).sort(function(a, b){
            return a.get('core').get('rank') - b.get('core').get('rank');
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

            var likePlayer = function() {
                player.get('core').save({
                    likes: !player.get('core').get('likes')
                });
            };

            var likeClass = 'fa fa-star';
            if(!player.get('core').get('likes')) {
                likeClass += '-o';
            }

            var slot = Math.ceil(player.get('core').get('position_rank') / 12);

            var position = null;
            while(position == null && slot > 0) {
                position = self.state.positions.findWhere({position: player.get('core').get('position'), slot: slot});
                slot--;
            }
            if(player == null) {
                player = new RosteredPlayer();
            }

            var value = player.get('core').get('adp') - player.get('core').get('rank');

            return (
                <tr key={index} className={cls} onClick={selectPlayer}>
                    <td><i className={likeClass} onClick={likePlayer} /></td>
                    <td>{team ? team.get('name') : '-'}</td>
                    <td>{player.get('core').get('rank')}</td>
                    <td>{player.get('core').get('adp')}</td>
                    <td>{value}</td>
                    <td>{player.get('core').get('position') + player.get('core').get('position_rank')}</td>
                    <td>{player.get('core').get('name')}</td>
                    <td>{player.get('core').get('team_name')}</td>
                    <td>${player.get('core').get('target_price')}</td>
                    <td>${position ? position.get('target_price') : ''}</td>
                    <td>${position ? position.get('adjusted_target_price'): ''}</td>
                    <td>{player.get('core').get('dropoff')}</td>
                    <td>{player.get('core').get('risk')}</td>
                    <td>{player.get('core').get('bye')}</td>
                </tr>
            );
        });

        var filters = Object.keys(this.state.filters).map(function(filter) {
            var onChange = function(val) {
                self.toggleFilter(filter, val);
            };
            return <span key={filter} className="filter-checkbox"><Checkbox checked={self.state.filters[filter]} onChange={onChange}/> {filter}</span>;
        });

        return (
            <div className="players-list">
                <div>
                    {filters}
                </div>
                <table className="table table-bordered table-hover">
                    <thead>
                    <th>Like</th>
                    <th>Owner</th>
                    <th>Rank</th>
                    <th>ADP</th>
                    <th>Value</th>
                    <th>Position</th>
                    <th>Name</th>
                    <th>Team</th>
                    <th>Price</th>
                    <th>Target</th>
                    <th>Adj Tar</th>
                    <th>Dropoff</th>
                    <th>Risk</th>
                    <th>Bye</th>
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
