/** @jsx React.DOM */

'use strict';

var React = require('react');

var PlayerStore = require('../../stores/PlayerStore');

var DragDrop = require('../mixins/DragDrop');

var TeamListItem = React.createClass({
    displayName: 'TeamListItem',

    mixins: [DragDrop],

    getInitialState() {
        return {
            team: this.props.team,
            players: PlayerStore.getAll()
        };
    },

    componentWillReceiveProps(nextProps) {
        this.setState({
            team: nextProps.team
        });
    },

    componentDidMount() {
        PlayerStore.addChangeCurrentListener(this.onPlayerChange);
        PlayerStore.addChangeAllListener(this.onPlayerChange);
    },
    componentWillUnmount() {
        PlayerStore.removeChangeListener(this.onPlayerChange);
    },

    onPlayerChange() {
        this.setState({
            players: PlayerStore.getAll()
        });
    },

    getType() {
        return "teamListItem";
    },
    canDrop(type, item) {
        return type === "filterBar" &&
            parseInt(PlayerStore.getValue()) > 0 &&
            item.player.get('id') > 0 &&
            !item.player.get('team_id');
    },

    render() {
        var positions = {
            'QB': 0,
            'RB': 0,
            'WR': 0,
            'TE': 0,
            'D': 0,
            'K': 0
        };

        var needed = {
            'QB': 1,
            'RB': 4,
            'WR': 4,
            'TE': 1,
            'D': 1,
            'K': 1
        };

        var playerCount = 0;
        var points = 0;
        this.state.players.where({team_id: this.state.team.get('id')}).forEach(function(player){
            positions[player.get('core').get('position')]++;
            playerCount++;
            points += player.get('core').get('points') || 0;
        });

        positions = Object.keys(positions).map(function(key){
            var colorClass = "panel panel-";
            if(positions[key] == 0) {
                colorClass += 'danger';
            } else if(positions[key] >= needed[key]) {
                colorClass += 'success';
            } else {
                colorClass += 'warning';
            }
            return (
                <div className="col-xs-2" key={key}>
                    <div className={colorClass}>
                        <div className="panel-heading">
                            {key}
                        </div>
                        <div className="panel-body">
                            {positions[key]}
                        </div>
                    </div>
                </div>
            );
        });

        var className = "teams-list-item";
        if(this.state.canDrop) {
            className += " droppable";
        }
        if(this.state.team.get('is_turn')) {
            className += "  panel-info";
        } else {
            className += "  panel-default";
        }

        var money = parseInt(this.state.team.get('money'));
        var moneyClass = 'label label-';
        if(money > 160) {
            moneyClass += 'success';
        }else if(money > 100) {
            moneyClass += 'info';
        }else if(money > 20) {
            moneyClass += 'warning';
        }else {
            moneyClass += 'danger';
        }

        var pointsPerDollar =  Math.round((money < 200 ? points / (200 - money) : 0)*100)/100;

        var maxBid = this.state.team.get('money') - (15-playerCount);

        return (
            <div className={className}
                 onDragStart={this.onDrag}
                 onDragOver={this.onDragOver}
                 onDragLeave={this.onDragLeave}
                 onDrop={this.onDrop}>

                <div className="panel-heading">
                    <h4>
                        <span>{this.state.team.get('name')}</span> &nbsp;
                        <small>{pointsPerDollar}</small>
                        <span className={moneyClass}>${maxBid} - ${this.state.team.get('money')}</span>
                    </h4>
                </div>
                <div className="panel-body">
                    {positions}
                </div>
            </div>
        );
    }
});

module.exports = TeamListItem;
