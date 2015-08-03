/** @jsx React.DOM */

'use strict';

var React = require('react');

var _ = require('underscore');

var RosterStore = require('../../stores/RosterStore');

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

    renderPlayer(indexOffset) {
        return function(player, index) {
            var cls = '';
            if(player.get('paid_price')) {
                cls = 'success';
            }
            if(player.get('core').get('name')) {
                return (
                    <tr key={index} className={cls}>
                        <td>{index+1+indexOffset}</td>
                        <td>{player.get('core').get('rank')}</td>
                        <td>{player.get('core').get('position') + player.get('core').get('position_rank')}</td>
                        <td>{player.get('core').get('name')}</td>
                        <td>{player.get('core').get('team_name')}</td>
                        <td>{player.get('paid_price') ? "$" + player.get('paid_price') : '-'}</td>
                        <td>${player.get('core').get('target_price')}</td>
                        <td>{player.get('core').get('bye')}</td>
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
                    </tr>
                );
            }

        };
    },

    render() {
        var starters = this.state.roster.get('starters').map(this.renderPlayer(0));
        var bench = this.state.roster.get('bench').map(this.renderPlayer(9));
        return (
            <div className="roster">
                <div className="table-body">
                    <table className="table table-bordered table-hover">
                        <thead>
                            <th></th>
                            <th>Rank</th>
                            <th>Position</th>
                            <th>Name</th>
                            <th>Team</th>
                            <th>Price Paid</th>
                            <th>Target Price</th>
                            <th>Bye</th>
                        </thead>
                        <tbody>
                            <tr key='break1'><td>Starters</td></tr>
                            {starters}
                            <tr key='break2'><td>Bench</td></tr>
                            {bench}
                        </tbody>
                    </table>
                </div>
                <div className="table-head">
                    <table className="table table-bordered table-hover">
                        <thead>
                            <th></th>
                            <th>Rank</th>
                            <th>Position</th>
                            <th>Name</th>
                            <th>Team</th>
                            <th>Price Paid</th>
                            <th>Target Price</th>
                            <th>Bye</th>
                        </thead>
                        <tbody></tbody>
                    </table>
                </div>
            </div>
        );
    }
});

module.exports = Roster;
