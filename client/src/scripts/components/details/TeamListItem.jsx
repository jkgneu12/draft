/** @jsx React.DOM */

'use strict';

var React = require('react');

var PlayerStore = require('../../stores/PlayerStore');
var DraftStore = require('../../stores/DraftStore');

var DragDrop = require('../mixins/DragDrop');

var TeamListItem = React.createClass({
    displayName: 'TeamListItem',

    mixins: [DragDrop],

    getInitialState() {
        return {
            team: this.props.team,
            players: PlayerStore.getAll(),
            draft: DraftStore.getCurrent()
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
        DraftStore.addChangeCurrentListener(this.onDraftChange);
    },
    componentWillUnmount() {
        PlayerStore.removeChangeListener(this.onPlayerChange);
        DraftStore.removeChangeListener(this.onDraftChange);
    },

    onPlayerChange() {
        this.setState({
            players: PlayerStore.getAll()
        });
    },

    onDraftChange() {
        this.setState({
            draft: DraftStore.getCurrent()
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
            'RB': 2,
            'WR': 2,
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

        var maxBudget = this.state.draft.get('max_budget');

        var money = parseInt(this.state.team.get('money'));
        var moneyClass = 'label label-';
        if(money > maxBudget * .75) {
            moneyClass += 'success';
        }else if(money > maxBudget * .5) {
            moneyClass += 'info';
        }else if(money > maxBudget* .25) {
            moneyClass += 'warning';
        }else {
            moneyClass += 'danger';
        }

        var pointsPerDollar =  Math.round((money < maxBudget ? points / (maxBudget - money) : 0)*100)/100;

        var maxBid = this.state.team.get('money') - (this.state.draft.get('team_size') - 1 - playerCount);

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
