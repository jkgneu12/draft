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
        return type === "filterBar" && parseInt(PlayerStore.getValue()) > 0 && item.player.get('id') > 0;
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

        this.state.players.where({team_id: this.state.team.get('id')}).forEach(function(player){
            positions[player.get('core').get('position')]++;
        });

        positions = Object.keys(positions).map(function(key){
           return <span key={key}>{key + ":" + positions[key] + " "}</span>;
        });

        var className = "teams-list-item";
        if(this.state.canDrop) {
            className += " droppable";
        }

        return (
            <div className={className}
                 onDragStart={this.onDrag}
                 onDragOver={this.onDragOver}
                 onDragLeave={this.onDragLeave}
                 onDrop={this.onDrop}>
                <span>{this.state.team.get('name')}</span>
                <span className="pull-right">${this.state.team.get('money')}</span>
                {positions}
            </div>
        );
    }
});

module.exports = TeamListItem;
