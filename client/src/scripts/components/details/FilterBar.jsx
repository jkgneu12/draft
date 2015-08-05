/** @jsx React.DOM */

'use strict';

var React = require('react');

var PlayerStore = require('../../stores/PlayerStore');
var RosterStore = require('../../stores/RosterStore');

var Input = require('../form/Input');

var DragDrop = require('../mixins/DragDrop');

var FilterBar = React.createClass({
    displayName: 'FilterBar',

    mixins: [DragDrop],

    getInitialState() {
        return {
            filter: PlayerStore.getCurrent().get('core').get('name'),
            value: PlayerStore.getValue(),
            player: PlayerStore.getCurrent(),
            players: PlayerStore.getAll(),
            roster: RosterStore.getCurrent(),
            cores: PlayerStore.getAll().map(function(player){return player.get('core')})
        };
    },

   componentDidMount() {
        PlayerStore.addChangeCurrentListener(this.onPlayerChange);
        PlayerStore.addChangeAllListener(this.onPlayersChange);
        RosterStore.addChangeCurrentListener(this.onRosterChange);
    },
    componentWillUnmount() {
        PlayerStore.removeChangeListener(this.onPlayerChange);
        PlayerStore.removeChangeListener(this.onPlayersChange);
        RosterStore.removeChangeListener(this.onRosterChange);
    },

    onPlayerChange() {
        this.setState({
            player: PlayerStore.getCurrent(),
            filter: PlayerStore.getCurrent().get('core').get('name')
        });
    },

    onPlayersChange() {
        this.setState({
            players: PlayerStore.getAll(),
            cores: PlayerStore.getAll().map(function(player){return player.get('core')})
        });
    },

    onRosterChange() {
        this.setState({
            roster: RosterStore.getCurrent()
        });
    },

    updateFilter(text) {
        this.setState({
            filter: text
        });
    },

    updateValue(text) {
        this.setState({
            value: text
        });

        PlayerStore.setValue(text);
    },

    scrollValue(deltaX, deltaY, deltaFactor) {
        if(deltaY === 0) return;

        deltaY = Math.sqrt(Math.abs(deltaY)) * (deltaY / Math.abs(deltaY));
        var value = Math.round(Math.min(Math.max(1, parseInt(this.state.value) + deltaY), 200));
        this.setState({
            value: value
        });

        PlayerStore.setValue(value);
    },

    selectPlayer(core) {
        var player = PlayerStore.getAll().findWhere({core_id: core.get('id')});
        PlayerStore.setCurrent(player.get('id'));
    },

    getType() {
        return "filterBar";
    },
    canDrop(type, item) {
        return false;
    },

    render() {
        var maxPoints = '-';
        var pointsCls = 'label-default';
        if(this.state.player.get('max_points')[this.state.value]) {
            maxPoints = this.state.player.get('max_points')[this.state.value] + this.state.player.get('core').get('points');
            if(maxPoints > this.state.roster.get('max_points')) {
                pointsCls = 'label-success';
            }
            else if(maxPoints < this.state.roster.get('max_points')) {
                pointsCls = 'label-danger';
            }
        }
        pointsCls = 'label ' + pointsCls;

        return (

            <div className="filter-bar"
                 draggable="true"
                 onDragStart={this.onDrag}
                 onDragOver={this.onDragOver}
                 onDragLeave={this.onDragLeave}
                 onDrop={this.onDrop}>

                <div className="row">
                    <div className="col-xs-8">
                        <Input value={this.state.filter}
                               onChange={this.updateFilter}
                               onSelected={this.selectPlayer}
                               autocompletes={this.state.cores}
                               autocompleteKey="name" />
                    </div>
                    <div className="col-xs-2">
                        <Input value={this.state.value}
                               onChange={this.updateValue}
                               onScroll={this.scrollValue}/>
                    </div>
                    <div className="col-xs-2">
                        <span className={pointsCls}>
                        {maxPoints} / {this.state.roster.get('max_points')}
                        </span>
                    </div>
                </div>

            </div>
        );
    }
});

module.exports = FilterBar;
