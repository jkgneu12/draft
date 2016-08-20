/** @jsx React.DOM */

'use strict';

var React = require('react');

var DraftStore = require('../../stores/DraftStore');
var TeamStore = require('../../stores/TeamStore');
var PlayerStore = require('../../stores/PlayerStore');
var RosterStore = require('../../stores/RosterStore');

var TeamsList = require('../details/TeamsList');
var FilterBar = require('../details/FilterBar');
var Roster = require('../details/Roster');
var PlayerDetails = require('../details/PlayerDetails');
var PlayersList = require('../details/PlayersList');

var DraftPage = React.createClass({
    displayName: 'DraftPage',
    getInitialState() {
        return {
            draft: DraftStore.getCurrent()
        };
    },

    componentDidMount() {
        DraftStore.setCurrent(this.props.params.draftId);
        TeamStore.loadAll({draftId: this.props.params.draftId});
        PlayerStore.loadAll({draftId: this.props.params.draftId});
        RosterStore.setCurrent(this.props.params.draftId);

        DraftStore.addChangeCurrentListener(this.onDraftChange);
    },
    componentWillUnmount() {
        DraftStore.setCurrent(-1);

        DraftStore.removeChangeListener(this.onDraftChange);
    },

    onDraftChange() {
        this.setState({
            draft: DraftStore.getCurrent()
        });
    },

    render() {

        return (
            <div className="draft fill-height">
                <div className="row fill-height">
                    <div className="col-xs-8 left-side fill-height">
                        <FilterBar />
                        <PlayerDetails />
                        <PlayersList />
                        <Roster />
                    </div>
                    <div className="col-xs-4 right-side fill-height">
                        <h4 className="round-label">{"Round " + this.state.draft.get('round') + 1}</h4>
                        <TeamsList />
                    </div>
                </div>



            </div>
        );
    }
});

module.exports = DraftPage;
