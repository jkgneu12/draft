/** @jsx React.DOM */

'use strict';

var React = require('react');

var PlayerStore = require('../../stores/PlayerStore');
var RosterStore = require('../../stores/RosterStore');
var TeamStore = require('../../stores/TeamStore');
var DraftStore = require('../../stores/DraftStore');

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
            cores: PlayerStore.getAll().map(function(player){return player.get('core')}),
            draft: DraftStore.getCurrent()
        };
    },

   componentDidMount() {
        PlayerStore.addChangeCurrentListener(this.onPlayerChange);
        PlayerStore.addChangeAllListener(this.onPlayersChange);
        RosterStore.addChangeCurrentListener(this.onRosterChange);
        TeamStore.addChangeAllListener(this.onTeamsChange);
        DraftStore.addChangeCurrentListener(this.onDraftChange);
    },
    componentWillUnmount() {
        PlayerStore.removeChangeListener(this.onPlayerChange);
        PlayerStore.removeChangeListener(this.onPlayersChange);
        RosterStore.removeChangeListener(this.onRosterChange);
        TeamStore.removeChangeListener(this.onTeamsChange);
        DraftStore.removeChangeListener(this.onDraftChange);
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

    onDraftChange() {
        this.setState({
            draft: DraftStore.getCurrent()
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
        var value = Math.round(Math.min(Math.max(1, parseInt(this.state.value) + deltaY), this.state.draft.get('max_budget')));
        this.setState({
            value: value
        });

        PlayerStore.setValue(value);
    },

    selectPlayer(core) {
        var player = PlayerStore.getAll().findWhere({core_id: core.get('id')});
        PlayerStore.setCurrent(player.get('id'));
        PlayerStore.refreshCurrent();
    },

    getType() {
        return "filterBar";
    },
    canDrop(type, item) {
        return false;
    },

    render() {
        var leaveColumn = null;
        var takeColumn = null;

        if(this.state.player.get('id')) {

            var playerCount = this.state.team ? this.state.players.where({team_id: this.state.team.get('id')}).length : 0;
            var maxBid = this.state.team ? this.state.team.get('money') - (this.state.draft.get('team_size') - 1 - playerCount) : 0;

            if (this.state.value > maxBid) {
                takeColumn = (
                    <i className='fa fa-times-circle'/>
                );
            } else {
                var playerMaxPoints = '-';
                var rosterMaxPoints = this.state.roster.get('max_points') / 16;
                var takeCls = 'label-default';
                if (this.state.player.get('max_points')[this.state.value]) {
                    playerMaxPoints = this.state.player.get('max_points')[this.state.value] / 16;
                    if (playerMaxPoints > rosterMaxPoints) {
                        takeCls = 'label-success';
                    }
                    else if (playerMaxPoints < rosterMaxPoints) {
                        takeCls = 'label-danger';
                    }
                }
                takeCls = 'label ' + takeCls;

                var leaveCls = 'label-default';
                var leavePoints = this.state.player.get('max_points')[0] / 16;
                if (leavePoints > rosterMaxPoints ) {
                    leaveCls = 'label-success';
                }
                else if (leavePoints < rosterMaxPoints ) {
                    leaveCls = 'label-danger';
                }
                leaveCls = 'label ' + leaveCls;

                leaveColumn = (
                    <div>
                        <small>Leave</small>&nbsp;
                        <div className={leaveCls}>
                            {Math.round((leavePoints - rosterMaxPoints) * 100)/100}
                        </div>
                    </div>
                );
                takeColumn = (
                    <div>
                        <small>Take</small>&nbsp;
                        <div className={takeCls}>
                            {Math.round((playerMaxPoints - rosterMaxPoints)*100)/100}
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
                    <div className="col-xs-6">
                        <Input value={this.state.filter}
                               onChange={this.updateFilter}
                               onSelected={this.selectPlayer}
                               autocompletes={this.state.cores}
                               autocompleteKey="name"
                               placeholder="Player Name..."/>
                    </div>
                    <div className="col-xs-2">
                        <Input value={this.state.value}
                               onChange={this.updateValue}
                               onScroll={this.scrollValue}/>
                    </div>
                    <div className="col-xs-2 points-column" style={{'textAlign': 'center'}}>
                        {leaveColumn}
                    </div>
                    <div className="col-xs-2 points-column" style={{'textAlign': 'center'}}>
                        {takeColumn}
                    </div>
                </div>

            </div>
        );
    }
});

module.exports = FilterBar;
