/** @jsx React.DOM */

'use strict';

var React = require('react');

var DraftStore = require('../../stores/DraftStore');

var DraftPage = React.createClass({
    displayName: 'DraftPage',
    statics: {
        willTransitionTo(transition, params) {
            DraftStore.setCurrent(params.draftId);
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
        DraftStore.addChangeCurrentListener(this.onDummyChange);
    },
    componentWillUnmount() {
        DraftStore.removeChangeListener(this.onDummyChange);
    },

    onDummyChange() {
        this.setState({
            draft: DraftStore.getCurrent()
        });
    },

    render() {

        return (
            <div className="fill-height">
                <div>{this.state.draft.get('name')}</div>
            </div>
        );
    }
});

module.exports = DraftPage;
