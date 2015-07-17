/** @jsx React.DOM */

'use strict';

var React = require('react');

var PlayerStore = require('../../stores/PlayerStore');

var PlayerDetails = React.createClass({
    displayName: 'PlayerDetails',

    getInitialState() {
        return {
            player: PlayerStore.getCurrent()
        };
    },

    componentDidMount() {
        PlayerStore.addChangeCurrentListener(this.onPlayerChange);
    },
    componentWillUnmount() {
        PlayerStore.removeChangeListener(this.onPlayerChange);
    },

    onPlayerChange() {
        this.setState({
            player: PlayerStore.getCurrent()
        });
    },

    render() {
        var content = null;
        if(this.state.player.get('id')) {
            var core = this.state.player.get('core');
            content = (
                <div className="row">
                    <div className="col-xs-4">
                        <div className="panel panel-success">
                            <div className="panel-heading">
                                Min Price
                            </div>
                            <div className="panel-body">
                                ${core.get('min_price')}
                            </div>
                        </div>
                    </div>
                    <div className="col-xs-4">
                        <div className="panel panel-primary">
                            <div className="panel-heading">
                                Target Price
                            </div>
                            <div className="panel-body">
                                ${core.get('target_price')}
                            </div>
                        </div>
                    </div>
                    <div className="col-xs-4">
                        <div className="panel panel-danger">
                            <div className="panel-heading">
                                Max Price
                            </div>
                            <div className="panel-body">
                                ${core.get('max_price')}
                            </div>
                        </div>
                    </div>


                    <div className="col-xs-4">
                        <div className="panel panel-default">
                            <div className="panel-heading">
                                Position
                            </div>
                            <div className="panel-body">
                                {core.get('position')}
                            </div>
                        </div>
                    </div>
                    <div className="col-xs-4">
                        <div className="panel panel-default">
                            <div className="panel-heading">
                                Rank
                            </div>
                            <div className="panel-body">
                                #{core.get('rank')}
                            </div>
                        </div>
                    </div>
                    <div className="col-xs-4">
                        <div className="panel panel-default">
                            <div className="panel-heading">
                                Position Rank
                            </div>
                            <div className="panel-body">
                                #{core.get('position_rank')}
                            </div>
                        </div>
                    </div>
                </div>
            );
        }
        return (
            <div className="player-details">
                {content}
            </div>
        );
    }
});

module.exports = PlayerDetails;
