/** @jsx React.DOM */

'use strict';

var React = require('react');

var DraftStore = require('../../stores/DraftStore');
var NavStore = require('../../stores/NavStore');

var Input = require('../form/Input');

var CreatePage = React.createClass({
    displayName: 'CreatePage',
    statics: {
        willTransitionTo(transition, params) {
            DraftStore.loadAll();
        }
    },
    getInitialState() {
        return {
            draft: {},
            drafts: DraftStore.getAll()
        };
    },

    componentDidMount() {
        DraftStore.addChangeAllListener(this.onDraftsChange);
    },
    componentWillUnmount() {
        DraftStore.removeChangeListener(this.onDraftsChange);
    },

    onDraftsChange() {
        this.setState({
            drafts: DraftStore.getAll()
        });
    },

    gotoDraft(id) {
        NavStore.emitNavigate('draft', {draftId: id});
    },

    createDraft() {
        DraftStore.create(this.state.draft);
    },

    updateDraftName(name) {
        this.state.draft.name = name;
        this.setState({
            draft: this.state.draft
        });
    },

    render() {
        var self = this;
        var drafts = this.state.drafts.map(function(draft){
            var navigate = function() {
                self.gotoDraft(draft.get('id'));
            };
            return <div key={draft.get('id')}><a onClick={navigate}>{draft.get('name')}</a></div>;
        });

        return (
            <div className="fill-height">
                {drafts}
                <Input value={this.state.draft.name} onChange={this.updateDraftName} />
                <button onClick={this.createDraft}>Create</button>
            </div>
        );
    }

});

module.exports = CreatePage;
