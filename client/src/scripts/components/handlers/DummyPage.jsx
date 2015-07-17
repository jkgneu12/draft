/** @jsx React.DOM */

'use strict';

var React = require('react');

var DummyStore = require('../../stores/DummyStore');

var DummyPage = React.createClass({
    displayName: 'DummyPage',
    statics: {
        willTransitionTo(transition, params) {
            DummyStore.setCurrent(params.dummyId);
        },
        willTransitionFrom() {
            DummyStore.setCurrent(-1);
        }
    },

    getInitialState() {
        return {
            dummy: DummyStore.getCurrent()
        };
    },

    componentDidMount() {
        DummyStore.addChangeCurrentListener(this.onDummyChange);
    },
    componentWillUnmount() {
        DummyStore.removeChangeListener(this.onDummyChange);
    },

    onDummyChange() {
        this.setState({
            dummy: DummyStore.getCurrent()
        });
    },

    render() {

        return (
            <div className="fill-height">
                <div>{this.state.dummy.get('name')}</div>
            </div>
        );
    }
});

module.exports = DummyPage;
