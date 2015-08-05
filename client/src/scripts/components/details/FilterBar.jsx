/** @jsx React.DOM */

'use strict';

var React = require('react');

var PlayerStore = require('../../stores/PlayerStore');
var RosterStore = require('../../stores/RosterStore');
var TeamStore = require('../../stores/TeamStore');

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
            team: TeamStore.getAll().findWhere({is_owner: true}),
            cores: PlayerStore.getAll().map(function(player){return player.get('core')})
        };
    },

   componentDidMount() {
        PlayerStore.addChangeCurrentListener(this.onPlayerChange);
        PlayerStore.addChangeAllListener(this.onPlayersChange);
        RosterStore.addChangeCurrentListener(this.onRosterChange);
        TeamStore.addChangeAllListener(this.onTeamsChange);
    },
    componentWillUnmount() {
        PlayerStore.removeChangeListener(this.onPlayerChange);
        PlayerStore.removeChangeListener(this.onPlayersChange);
        RosterStore.removeChangeListener(this.onRosterChange);
        TeamStore.removeChangeListener(this.onTeamsChange);
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

    onTeamsChange() {
        this.setState({
            team: TeamStore.getAll().findWhere({is_owner: true})
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
        var lastColumn = null;

        if(this.state.player.get('id')) {

            var playerCount = this.state.team ? this.state.players.where({team_id: this.state.team.get('id')}).length : 0;
            var maxBid = this.state.team ? this.state.team.get('money') - (15 - playerCount) : 0;

            if (this.state.value > maxBid) {
                lastColumn = (
                    <i className='fa fa-times-circle' style={{color: 'red', 'font-size': '2em'}}/>
                );
            } else {
                var maxPoints = '-';
                var pointsCls = 'label-default';
                if (this.state.player.get('max_points')[this.state.value]) {
                    maxPoints = this.state.player.get('max_points')[this.state.value];
                    if (maxPoints > this.state.roster.get('max_points')) {
                        pointsCls = 'label-success';
                    }
                    else if (maxPoints < this.state.roster.get('max_points')) {
                        pointsCls = 'label-danger';
                    }
                }
                pointsCls = 'label ' + pointsCls;

                lastColumn = (
                    <div>
                        <div className={pointsCls}>
                            {maxPoints - this.state.roster.get('max_points')}
                        </div>
                        <div>
                            {maxPoints} - {this.state.roster.get('max_points')}
                        </div>
                    </div>
                );
            }
        }

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
                    <div className="col-xs-2" style={{'text-align': 'center'}}>
                        {lastColumn}
                    </div>
                </div>

            </div>
        );
    }
});

module.exports = FilterBar;
