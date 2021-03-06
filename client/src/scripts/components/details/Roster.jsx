/** @jsx React.DOM */

'use strict';

var React = require('react');
var ReactDOM = require('react-dom');

var _ = require('underscore');

var PlayerStore = require('../../stores/PlayerStore');
var RosterStore = require('../../stores/RosterStore');

var Constants = require('../../constants/Constants');

var Roster = React.createClass({
    displayName: 'Roster',

    getInitialState() {
        return {
            roster: RosterStore.getCurrent()
        };
    },

    componentDidMount() {
        RosterStore.addChangeCurrentListener(this.onRosterChange);
       $(window).resize(this.resize).resize();
    },
    componentWillUnmount() {
        RosterStore.removeChangeListener(this.onRosterChange);
    },

    componentDidUpdate() {
        this.resize();
    },

    onRosterChange() {
        this.setState({
            roster: RosterStore.getCurrent()
        });
    },

    selectPlayer(player) {
        PlayerStore.setValue(player.get('core').get('adj_price'));
        PlayerStore.setCurrent(player.get('id'));
        PlayerStore.refreshCurrent();
    },
    benchPlayer(player) {
        PlayerStore.getAll().findWhere({id: player.get('id')}).save({
            bench: !player.get('bench')
        }, {
            success: function() {
                RosterStore.refreshCurrent();
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

    renderPlayer(indexOffset) {
        var self = this;
        return function(player, index) {
            var selectPlayer = function(){
                self.selectPlayer(player);
            };
            var benchPlayer = function(){
                self.benchPlayer(player);
            };
            var cls = '';
            var bench = '-';
            if(player.get('paid_price')) {
                cls = 'rostered';
                bench = <i className={player.get('bench') ? 'fa fa-check-square-o' : 'fa fa-square-o'} onClick={benchPlayer}/>;
            }
            cls += ' tier-' + player.get('core').get('tier');
            if(player.get('core').get('name')) {
                var points = Math.round(player.get('core').get('points') / Constants.WEEKS * 10)/10;
                var adjPoints = Math.round(player.get('core').get('adj_points') / Constants.WEEKS * 10)/10;

                return (
                    <tr key={index} className={cls} onClick={selectPlayer}>
                        <td>{index+1+indexOffset}</td>
                        <td>{player.get('core').get('adp_round')}</td>
                        <td>{bench}</td>
                        <td>{points}</td>
                        <td>{adjPoints}</td>
                        <td>{player.get('core').get('position') + player.get('core').get('position_rank')}</td>
                        <td>{player.get('core').get('tier')}</td>
                        <td>{player.get('core').get('name')}</td>
                        <td>{player.get('core').get('team_name')}</td>
                        <td>{player.get('paid_price') ? "$" + player.get('paid_price') : '-'}</td>
                        <td>${player.get('core').get('target_price')} ({player.get('core').get('adj_price')})</td>
                        <td>{player.get('core').get('risk')}</td>
                        <td>{player.get('core').get('consistency') / 100}</td>
                    </tr>
                );
            } else {
                return (
                    <tr key={index} className={cls}>
                        <td>{index+1+indexOffset}</td>
                        <td>-</td>
                        <td>-</td>
                        <td>-</td>
                        <td>-</td>
                        <td>-</td>
                        <td>-</td>
                        <td>-</td>
                        <td>-</td>
                        <td>-</td>
                        <td>-</td>
                        <td>-</td>
                    </tr>
                );
            }

        };
    },

    render() {
        var starters = this.state.roster.get('starters').map(this.renderPlayer(0));
        var bench = this.state.roster.get('bench').map(this.renderPlayer(starters.length));

        var totalPoints = 0;
        this.state.roster.get('starters').forEach(function(player){
            totalPoints += player.get('core').get('points');
        });
        var totalAdjPoints = 0;
        this.state.roster.get('starters').forEach(function(player){
            totalAdjPoints += player.get('core').get('adj_points');
        });
        return (
            <div className="roster">
                <div className="table-body">
                    <table className="table table-bordered table-hover">
                        <thead>
                            <tr>
                                <th></th>
                                <th>ADP</th>
                                <th>Benched</th>
                                <th>Points</th>
                                <th>Adj. Points</th>
                                <th>Position</th>
                                <th>Tier</th>
                                <th>Name</th>
                                <th>Team</th>
                                <th>Paid</th>
                                <th>Price</th>
                                <th>Risk</th>
                                <th>Consist</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr key='break1'>
                                <td>Starters</td>
                                <td></td>
                                <td></td>
                                <td>{Math.round(totalPoints / Constants.WEEKS * 10)/10}</td>
                                <td>{Math.round(totalAdjPoints / Constants.WEEKS * 10)/10}</td>
                            </tr>
                            {starters}
                            <tr key='break2'><td>Bench</td></tr>
                            {bench}
                        </tbody>
                    </table>
                </div>
                <div className="table-head">
                    <table className="table table-bordered table-hover">
                        <thead>
                            <tr>
                                <th></th>
                                <th>ADP</th>
                                <th>Benched</th>
                                <th>Points</th>
                                <th>Adj. Points</th>
                                <th>Position</th>
                                <th>Tier</th>
                                <th>Name</th>
                                <th>Team</th>
                                <th>Paid</th>
                                <th>Price</th>
                                <th>Risk</th>
                                <th>Consist</th>
                            </tr>
                        </thead>
                        <tbody></tbody>
                    </table>
                </div>
            </div>
        );
    }
});

module.exports = Roster;
