'use strict';

var React = require('react');

var PlayerStore = require('../../stores/PlayerStore');
var RosterStore = require('../../stores/RosterStore');
var TeamStore = require('../../stores/TeamStore');
var DraftStore = require('../../stores/DraftStore');

var Input = require('../form/Input');

var DragDrop = require('../mixins/DragDrop');

var Constants = require('../../constants/Constants');

var FilterBar = React.createClass({
    displayName: 'FilterBar',

    mixins: [DragDrop],

    getInitialState() {
        return {
            filter: PlayerStore.getCurrent().get('core').get('name') || '',
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
        var target = PlayerStore.getCurrent().get('core').get('adj_price');
        if(PlayerStore.getCurrent().get('max_starters_points')[0] != null) {
            var maxList = PlayerStore.getCurrent().get('max_starters_points');
            var rosterMaxPoints = this.state.roster.get('max_points') / Constants.WEEKS;

            var closest = -1;
            Object.keys(maxList).forEach(function(price) {
                var maxPoints = maxList[price] / Constants.WEEKS;
                if(maxPoints >= rosterMaxPoints) {
                    closest = price;
                }
            });

            if(closest >= 0 && PlayerStore.getValue() !== closest) {
                PlayerStore.setValue(closest);
            }
        }

        this.setState({
            player: PlayerStore.getCurrent(),
            value: PlayerStore.getValue(),
            filter: PlayerStore.getCurrent().get('core').get('name') || ''
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
        PlayerStore.setValue(core.get('adj_price'));
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
        var startColumn = null;
        var benchColumn = null;
        var clsName = 'filter-bar ';

        if(this.state.player.get('id')) {

            var playerCount = this.state.team ? this.state.players.where({team_id: this.state.team.get('id')}).length : 0;
            var maxBid = this.state.team ? this.state.team.get('money') - (this.state.draft.get('team_size') - 1 - playerCount) : 0;

            var maxStartersPoints = this.state.player.get('max_starters_points');
            var maxBenchPoints = this.state.player.get('max_bench_points');

            if (this.state.player.get('core').get('likes') == true) {
                clsName += 'success';
            }
            if (this.state.player.get('core').get('dislikes') == true) {
                clsName += 'danger';
            }

            if (this.state.value > maxBid) {
                startColumn = (
                    <i className='fa fa-times-circle'/>
                );
            } else {
                var rosterMaxPoints = this.state.roster.get('max_points') / Constants.WEEKS;

                var playerMaxStarterPoints = '-';
                var startCls = 'label-default';
                if (maxStartersPoints[this.state.value]) {
                    playerMaxStarterPoints = maxStartersPoints[this.state.value] / Constants.WEEKS;
                    if (playerMaxStarterPoints > rosterMaxPoints) {
                        startCls = 'label-success';
                    }
                    else if (playerMaxStarterPoints < rosterMaxPoints) {
                        startCls = 'label-danger';
                    }
                }
                startCls = 'label ' + startCls;

                var playerMaxBenchPoints = '-';
                var benchCls = 'label-default';
                if (maxBenchPoints[this.state.value]) {
                    playerMaxBenchPoints = maxBenchPoints[this.state.value] / Constants.WEEKS;
                    if (playerMaxBenchPoints > rosterMaxPoints) {
                        benchCls = 'label-success';
                    }
                    else if (playerMaxBenchPoints < rosterMaxPoints) {
                        benchCls = 'label-danger';
                    }
                }
                benchCls = 'label ' + benchCls;

                var leaveCls = 'label-default';
                var leavePoints = maxStartersPoints[0] / Constants.WEEKS;
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
                startColumn = (
                    <div>
                        <small>Start</small>&nbsp;
                        <div className={startCls}>
                            {Math.round((playerMaxStarterPoints - rosterMaxPoints)*100)/100}
                        </div>
                    </div>
                );
                benchColumn = (
                    <div>
                        <small>Bench</small>&nbsp;
                        <div className={benchCls}>
                            {Math.round((playerMaxBenchPoints - rosterMaxPoints)*100)/100}
                        </div>
                    </div>
                );
            }
        }

        return (

            <div className={clsName}
                 draggable="true"
                 onDragStart={this.onDrag}
                 onDragOver={this.onDragOver}
                 onDragLeave={this.onDragLeave}
                 onDrop={this.onDrop}>

                <div className="row">
                    <div className="col-xs-4">
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
                        {startColumn}
                    </div>
                    <div className="col-xs-2 points-column" style={{'textAlign': 'center'}}>
                        {benchColumn}
                    </div>
                </div>

            </div>
        );
    }
});

module.exports = FilterBar;
