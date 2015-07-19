/** @jsx React.DOM */

'use strict';

var React = require('react');

var DraftStore = require('../../stores/DraftStore');
var TeamStore = require('../../stores/TeamStore');
var PlayerStore = require('../../stores/PlayerStore');
var RosteredPlayerStore = require('../../stores/RosteredPlayerStore');

var TeamsList = require('../details/TeamsList');
var FilterBar = require('../details/FilterBar');
var Roster = require('../details/Roster');
var PlayerDetails = require('../details/PlayerDetails');
var PlayersList = require('../details/PlayersList');

var DraftPage = React.createClass({
    displayName: 'DraftPage',
    statics: {
        willTransitionTo(transition, params) {
            DraftStore.setCurrent(params.draftId);
            TeamStore.loadAll({draftId: params.draftId});
            PlayerStore.loadAll({draftId: params.draftId});
            RosteredPlayerStore.loadAll({draftId: params.draftId});
        },
        willTransitionFrom() {
            DraftStore.setCurrent(-1);
        }
    },

    getInitialState() {
        return {
            draft: DraftStore.getCurrent()
        };
    },

    componentDidMount() {
        DraftStore.addChangeCurrentListener(this.onDraftChange);
    },
    componentWillUnmount() {
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
                        <h4 className="round-label">Round {this.state.draft.get('round')} / {this.state.draft.get('rounds')}</h4>
                        <TeamsList />
                    </div>
                </div>



            </div>
        );
    }
});

module.exports = DraftPage;
