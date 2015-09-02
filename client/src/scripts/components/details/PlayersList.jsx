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
            teams: TeamStore.getAll(),
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
        TeamStore.addChangeAllListener(this.onTeamsChange);


        $(window).resize(this.resize).resize();
    },
    componentWillUnmount() {
        PlayerStore.removeChangeListener(this.onPlayerChange);
        PlayerStore.removeChangeListener(this.onPlayersChange);
        TeamStore.removeChangeListener(this.onTeamsChange);
    },

    componentDidUpdate() {
        this.resize();
    },

    onPlayerChange() {
        this.setState({
            player: PlayerStore.getCurrent()
        });
        if(PlayerStore.getCurrent().get('id')) {
            var player = $(this.getDOMNode()).find('#player_' + PlayerStore.getCurrent().get('id'));
            if(player.size() > 0) {
                var table = $(this.getDOMNode()).find('.table-body');
                var scroll = table.scrollTop();
                var playerTop = player.offset().top;
                table.scrollTop(scroll + playerTop - table.offset().top - player.height());
            }
        }
    },

    onPlayersChange() {
        this.setState({
            players: PlayerStore.getAll()
        });
    },

    onTeamsChange() {
        this.setState({
            teams: TeamStore.getAll()
        });
    },

    selectPlayer(player) {
        PlayerStore.setCurrent(player.get('id'));
        PlayerStore.refreshCurrent();
    },

    toggleFilter(filter, val) {
        this.state.filters[filter] = val;
        this.setState({
            filters: this.state.filters
        });
    },

    likePlayer(player) {
        player.get('core').set('likes', !player.get('core').get('likes'));
        this.setState({players: this.state.players});
        player.get('core').save();
    },

    resize() {
        var $tableHead = $(this.getDOMNode()).find('.table-head');
        var $tableBody = $(this.getDOMNode()).find('.table-body');
        var $headCells = $tableHead.find('thead tr:first').children();
        var $bodyCells = $tableBody.find('thead tr:first').children();

        var colWidth = $bodyCells.map(function() {
            return $(this).width();
        }).get();

        $headCells.each(function(i, v) {
            $(v).width(colWidth[i]);
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
                var ownerTeam = self.state.teams.findWhere({is_owner: true});
                if(ownerTeam && player.get('team_id') == ownerTeam.get('id')) {
                    cls = 'success';
                } else {
                    cls = 'warning';
                }
            }
            else if(self.state.player.get('id') === player.get('id')) {
                cls = 'info';
            }

            var team = self.state.teams.findWhere({id: player.get('team_id')});

            var likePlayer = function(e) {
                self.likePlayer(player);
                e.stopImmediatePropagation();
                e.preventDefault();
            };

            var likeClass = 'fa fa-star';
            if(!player.get('core').get('likes')) {
                likeClass += '-o';
            }

            if(player == null) {
                player = new RosteredPlayer();
            }

            return (
                <tr id={"player_" + player.get('id')} key={index} className={cls} onClick={selectPlayer}>
                    <td><i className={likeClass} onClick={likePlayer} /></td>
                    <td>{team ? team.get('name') : '-'}</td>
                    <td>{player.get('core').get('rank')}</td>
                    <td>{player.get('core').get('ecr')}</td>
                    <td>{Math.round(player.get('core').get('points') / 16 * 10)/10}</td>
                    <td>{player.get('core').get('position') + player.get('core').get('position_rank')}</td>
                    <td>{player.get('core').get('name')}</td>
                    <td>{player.get('core').get('team_name')}</td>
                    <td>${player.get('core').get('target_price')} ({player.get('core').get('adj_price')})</td>
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

        var toggleAllFilters = function(val) {
            Object.keys(self.state.filters).forEach(function(filter) {
                self.toggleFilter(filter, val);
            })
        };
        var allChecked = true;
        Object.keys(self.state.filters).forEach(function(filter){
            if(!self.state.filters[filter]) {
                allChecked = false;
            }
        });
        var toggleAllCheckbox = (
            <span key='toggleAll' className="filter-checkbox">
                <Checkbox checked={allChecked} onChange={toggleAllFilters}/> All
            </span>);
        filters.splice(0, 0, toggleAllCheckbox);

        return (
            <div className="players-list">
                <div className="table-body">
                    <table className="table table-bordered table-hover">
                        <thead>
                            <tr>
                                <th>Like</th>
                                <th>Owner</th>
                                <th>Rank</th>
                                <th>ECR</th>
                                <th>Points</th>
                                <th>Position</th>
                                <th>Name</th>
                                <th>Team</th>
                                <th>Price</th>
                                <th>Risk</th>
                                <th>Bye</th>
                            </tr>
                        </thead>
                        <tbody>
                            {players}
                        </tbody>
                    </table>
                </div>
                <div className="filters">
                    {filters}
                </div>
                <div className="table-head">
                    <table className="table table-bordered table-hover">
                        <thead>
                            <tr>
                                <th>Like</th>
                                <th>Owner</th>
                                <th>Rank</th>
                                <th>ECR</th>
                                <th>Points</th>
                                <th>Position</th>
                                <th>Name</th>
                                <th>Team</th>
                                <th>Price</th>
                                <th>Risk</th>
                                <th>Bye</th>
                            </tr>
                        </thead>
                        <tbody></tbody>
                    </table>
                </div>
            </div>
        );
    }
});

module.exports = PlayersList;
