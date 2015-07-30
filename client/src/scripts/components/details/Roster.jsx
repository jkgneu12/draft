/** @jsx React.DOM */

'use strict';

var React = require('react');

var _ = require('underscore');

var RosteredPlayerStore = require('../../stores/RosteredPlayerStore');

var Roster = React.createClass({
    displayName: 'Roster',

    getInitialState() {
        return {
            positions: RosteredPlayerStore.getAll()
        };
    },

    componentDidMount() {
        RosteredPlayerStore.addChangeAllListener(this.onPositionsChange);
    },
    componentWillUnmount() {
        RosteredPlayerStore.removeChangeListener(this.onPositionsChange);
    },

    onPositionsChange() {
        this.setState({
            positions: RosteredPlayerStore.getAll()
        });
    },

    render() {


        var roster = this.state.positions.map(function(position, index) {
            var player = position.get('player');

            if (player.get('id') > 0) {
                var cls = '';
                if (player.get('paid_price') > position.get('target_price')) {
                    cls = 'danger';
                }
                if (player.get('paid_price') <= position.get('target_price')) {
                    cls = 'success';
                }
                return (
                    <tr key={index} className={cls}>
                        <td>{index+1}</td>
                        <td>{position.get('position') + position.get('slot')}</td>
                        <td>{player.get('core').get('rank')}</td>
                        <td>{player.get('core').get('position') + player.get('core').get('position_rank')}</td>
                        <td>{player.get('core').get('name')}</td>
                        <td>{player.get('core').get('team_name')}</td>
                        <td>${player.get('paid_price')}</td>
                        <td>${position.get('target_price')}</td>
                        <td>${position.get('adjusted_target_price')}</td>
                        <td>{Math.round(position.get('importance') * 100)}%</td>
                        <td>{player.get('core').get('bye')}</td>
                    </tr>
                );
            } else {
                return (
                    <tr key={index}>
                        <td>{index+1}</td>
                        <td>{position.get('position') + position.get('slot')}</td>
                        <td>-</td>
                        <td>-</td>
                        <td>-</td>
                        <td>-</td>
                        <td>-</td>
                        <td>${position.get('target_price')}</td>
                        <td>${position.get('adjusted_target_price')}</td>
                        <td>{Math.round(position.get('importance') * 100)}%</td>
                        <td>-</td>
                    </tr>
                );
            }
        });
        return (
            <div className="roster">
                <table className="table table-bordered table-hover">
                    <thead>
                        <th></th>
                        <th>Slot</th>
                        <th>Rank</th>
                        <th>Position</th>
                        <th>Name</th>
                        <th>Team</th>
                        <th>Price Paid</th>
                        <th>Target Price</th>
                        <th>Adj Target Price</th>
                        <th>Importance</th>
                        <th>Bye</th>
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
