/** @jsx React.DOM */

'use strict';

var React = require('react');

var TeamStore = require('../../stores/TeamStore');
var PlayerStore = require('../../stores/PlayerStore');

var Roster = React.createClass({
    displayName: 'Roster',

    getInitialState() {
        return {
            players: PlayerStore.getAll(),
            ownerTeam: TeamStore.getAll().findWhere({is_owner: true})
        };
    },

    componentDidMount() {
        PlayerStore.addChangeCurrentListener(this.onPlayersChange);
        PlayerStore.addChangeAllListener(this.onPlayersChange);
        TeamStore.addChangeAllListener(this.onTeamsChange);
    },
    componentWillUnmount() {
        PlayerStore.removeChangeListener(this.onPlayersChange);
        TeamStore.removeChangeListener(this.onTeamsChange);
    },

    onPlayersChange() {
        this.setState({
            players: PlayerStore.getAll()
        });
    },
    onTeamsChange() {
        this.setState({
            ownerTeam: TeamStore.getAll().findWhere({is_owner: true})
        });
    },

    render() {
        var roster = [];
        if(this.state.ownerTeam) {
            var teamId = this.state.ownerTeam.get('id');
            roster = this.state.players.where({team_id: teamId}).map(function(player, index){
                var cls = '';
                 if(player.get('paid_price') > player.get('core').get('target_price')) {
                    cls = 'danger';
                }
                if(player.get('paid_price') < player.get('core').get('target_price')) {
                    cls = 'success';
                }
                return (
                    <tr key={index} className={cls}>
                        <td>{player.get('core').get('rank')}</td>
                        <td>#{player.get('core').get('position_rank')}</td>
                        <td>#{player.get('core').get('position')}</td>
                        <td>{player.get('core').get('name')}</td>
                        <td>{player.get('core').get('team_name')}</td>
                        <td>${player.get('paid_price')}</td>
                        <td>${player.get('core').get('target_price')}</td>
                    </tr>
                );
            });
        }
        return (
            <div className="roster">
                <table className="table table-striped table-bordered table-hover">
                    <thead>
                        <th>Rank</th>
                        <th>Pos Rank</th>
                        <th>Position</th>
                        <th>Name</th>
                        <th>Team</th>
                        <th>Price Paid</th>
                        <th>Target Price</th>
                    </thead>
                    <tbody>
                        {roster}
                    </tbody>
                </table>
            </div>
        );
    }
});

module.exports = Roster;
