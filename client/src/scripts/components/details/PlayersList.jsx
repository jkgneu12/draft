/** @jsx React.DOM */

'use strict';

var React = require('react');
var ReactDOM = require('react-dom');

var _ = require('underscore');

var PlayerStore = require('../../stores/PlayerStore');
var TeamStore = require('../../stores/TeamStore');
var RosterStore = require('../../stores/RosterStore');

var Checkbox = require('../form/Checkbox');

var Constants = require('../../constants/Constants');

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
        var filters = PlayerStore.getCurrent().get('id') == null ? {
            QB: true,
            RB: true,
            WR: true,
            TE: true,
            D: true,
            K: true
        } : {
            QB: false,
            RB: false,
            WR: false,
            TE: false,
            D: false,
            K: false
        };
        if(PlayerStore.getCurrent().get('id') != null) {
            filters[PlayerStore.getCurrent().get('core').get('position')] = true;
        }
        this.setState({
            player: PlayerStore.getCurrent(),
            filters: filters
        });
        if(PlayerStore.getCurrent().get('id')) {
            var player = $(ReactDOM.findDOMNode(this)).find('#player_' + PlayerStore.getCurrent().get('id'));
            if(player.length > 0) {
                var table = $(ReactDOM.findDOMNode(this)).find('.table-body');
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
        PlayerStore.setValue(player.get('core').get('adj_price'));
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
        player.get('core').save({
            'likes': !player.get('core').get('likes')
        }, {
            success: function(){
                RosterStore.refreshCurrent();
                PlayerStore.refreshCurrent();
            }
        });
    },

    dislikePlayer(player) {
        player.get('core').save({
            'dislikes': !player.get('core').get('dislikes')
        }, {
            success: function(){
                RosterStore.refreshCurrent();
                PlayerStore.refreshCurrent();
            }
        });
    },

    resize() {
        var $tableHead = $(ReactDOM.findDOMNode(this)).find('.table-head');
        var $tableBody = $(ReactDOM.findDOMNode(this)).find('.table-body');
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
                return null;
            }
            else if(self.state.player.get('id') === player.get('id')) {
                cls = 'info';
            }

            var team = self.state.teams.findWhere({id: player.get('team_id')});

            var dislikePlayer = function(e) {
                self.dislikePlayer(player);
                e.nativeEvent.stopImmediatePropagation();
                e.nativeEvent.preventDefault();
            };
            var likePlayer = function(e) {
                self.likePlayer(player);
                e.nativeEvent.stopImmediatePropagation();
                e.nativeEvent.preventDefault();
            };

            var dislikeClass = 'fa fa-thumbs-down';
            if(!player.get('core').get('dislikes')) {
                dislikeClass = 'fa fa-thumbs-o-down';
            }

            var likeClass = 'fa fa-thumbs-up';
            if(!player.get('core').get('likes')) {
                likeClass = 'fa fa-thumbs-o-up';
            }

            if(player == null) {
                player = new RosteredPlayer();
            }

            var points = Math.round(player.get('core').get('points') / Constants.WEEKS * 10)/10;

            return (
                <tr id={"player_" + player.get('id')} key={index} className={cls} onClick={selectPlayer}>
                    <td><i className={likeClass} onClick={likePlayer} /></td>
                    <td><i className={dislikeClass} onClick={dislikePlayer} /></td>
                    <td>{team ? team.get('name') : '-'}</td>
                    <td>{player.get('core').get('rank')}</td>
                    <td>{points}</td>
                    <td>{player.get('core').get('position') + player.get('core').get('position_rank')}</td>
                    <td>{player.get('core').get('tier')}</td>
                    <td>{player.get('core').get('name')}</td>
                    <td>{player.get('core').get('team_name')}</td>
                    <td>${player.get('core').get('target_price')} ({player.get('core').get('adj_price')})</td>                    
                    <td>{player.get('core').get('risk')}</td>
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
                                <th>Exclude</th>
                                <th>Owner</th>
                                <th>Rank</th>
                                <th>Points</th>
                                <th>Position</th>
                                <th>Tier</th>
                                <th>Name</th>
                                <th>Team</th>
                                <th>Price</th>                                
                                <th>Risk</th>
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
                                <th>Exclude</th>
                                <th>Owner</th>
                                <th>Rank</th>
                                <th>Points</th>
                                <th>Position</th>
                                <th>Tier</th>
                                <th>Name</th>
                                <th>Team</th>
                                <th>Price</th>
                                <th>Risk</th>
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
