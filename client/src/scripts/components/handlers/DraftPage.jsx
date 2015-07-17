/** @jsx React.DOM */

'use strict';

var React = require('react');

var DraftStore = require('../../stores/DraftStore');
var TeamStore = require('../../stores/TeamStore');
var PlayerStore = require('../../stores/PlayerStore');

var TeamsList = require('../details/TeamsList');
var FilterBar = require('../details/FilterBar');

var DraftPage = React.createClass({
    displayName: 'DraftPage',
    statics: {
        willTransitionTo(transition, params) {
            DraftStore.setCurrent(params.draftId);
            TeamStore.loadAll({draftId: params.draftId});
            PlayerStore.loadAll({draftId: params.draftId});
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
            <div className="fill-height">
                <div className="row">
                    <div className="col-xs-8">
                        <div>{this.state.draft.get('round')} / {this.state.draft.get('rounds')}</div>
                        <FilterBar />
                    </div>
                    <div className="col-xs-4">
                        <TeamsList />
                    </div>
                </div>



            </div>
        );
    }
});

module.exports = DraftPage;
