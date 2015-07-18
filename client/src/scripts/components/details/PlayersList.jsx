/** @jsx React.DOM */

'use strict';

var React = require('react');

var PlayerStore = require('../../stores/PlayerStore');
var TeamStore = require('../../stores/TeamStore');

var PlayersList = React.createClass({
    displayName: 'PlayersList',

    getInitialState() {
        return {
            player: PlayerStore.getCurrent(),
            players: PlayerStore.getAll()
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

    render() {
        var self = this;
        var players = this.state.players.map(function(player, index){
            var selectPlayer = function(){
                self.selectPlayer(player);
            };
            var cls = '';
             if(player.get('team_id')) {
                cls = 'warning';
            }
            if(self.state.player.get('id') === player.get('id')) {
                cls = 'success';
            }

            var team = TeamStore.getAll().findWhere({id: player.get('team_id')});
            return (
                <tr key={index} className={cls} onClick={selectPlayer}>
                    <td>{team ? team.get('name') : '-'}</td>
                    <td>{player.get('core').get('rank')}</td>
                    <td>#{player.get('core').get('position_rank')}</td>
                    <td>#{player.get('core').get('position')}</td>
                    <td>{player.get('core').get('name')}</td>
                    <td>{player.get('core').get('team_name')}</td>
                    <td>${player.get('core').get('min_price')}</td>
                    <td>${player.get('core').get('max_price')}</td>
                    <td>${player.get('core').get('target_price')}</td>
                </tr>
            );
        });

        var content = null;
        if(players.length === 0) {
            content = (
                <i className="fa fa-spinner fa-spin"></i>
            );
        } else {
            content = (
                <table className="table table-striped table-bordered table-hover">
                    <thead>
                    <th>Owner</th>
                    <th>Rank</th>
                    <th>Pos Rank</th>
                    <th>Position</th>
                    <th>Name</th>
                    <th>Team</th>
                    <th>Min Price</th>
                    <th>Max Price</th>
                    <th>Target Price</th>
                    </thead>
                    <tbody>
                    {players}
                    </tbody>
                </table>
            );
        }

        return (
            <div className="players-list">
                {content}
            </div>
        );
    }
});

module.exports = PlayersList;
