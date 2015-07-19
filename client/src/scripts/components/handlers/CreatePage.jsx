/** @jsx React.DOM */

'use strict';

var React = require('react');

var DraftStore = require('../../stores/DraftStore');
var TeamStore = require('../../stores/TeamStore');
var NavStore = require('../../stores/NavStore');

var Input = require('../form/Input');
var Checkbox = require('../form/Checkbox');

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
            teams: [],
            teamName: "",
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
        var self = this;
        DraftStore.create(this.state.draft, {}, {
            success: function(draft) {
                self.state.teams.forEach(function(team, index){
                    team.order = index;
                    TeamStore.create(team, {draftId: draft.get('id')});
                });
                self.gotoDraft(draft.get('id'));
            }
        });
    },

    updateDraftName(name) {
        this.state.draft.name = name;
        this.setState({
            draft: this.state.draft
        });
    },

    deleteTeam: function(index) {
        this.state.teams.splice(index, 1);
        this.setState({
            teams: this.state.teams
        });
    },

    setOwner: function(index, checked) {
        this.state.teams.forEach(function(team, idx){
            if(checked || idx === index) {
                team.is_owner = idx === index && checked;
            }
        });

        this.setState({
            teams: this.state.teams
        });
    },

    updateTempTeamName(name) {
        this.setState({
            teamName: name
        });
    },

    addTeam: function() {
        this.state.teams.push({
            name: this.state.teamName,
            is_owner: false
        });
        this.setState({
            teams: this.state.teams,
            teamName: ""
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

        var teams = this.state.teams.map(function(team, index){
            var deleteTeam = function() {
                self.deleteTeam(index);
            };
            var setOwner = function(checked) {
                self.setOwner(index, checked);
            };
            return (
                <tr key={index}>
                    <td className="col-xs-2">{index}</td>
                    <td className="col-xs-8">{team.name}</td>
                    <td className="col-xs-2"><Checkbox checked={team.is_owner} onChange={setOwner}/></td>
                    <td className="col-xs-2"><button className="btn btn-danger btn-sm" onClick={deleteTeam}><i className="fa fa-close"></i></button></td>
                </tr>
            );
        });

        var canCreate = teams.length > 1 && this.state.draft.name;

        if(teams.length === 0) {
            teams = <tr><td><small>No teams</small></td></tr>;
        }

        return (
            <div className="create fill-height">
                <div className="create-body">
                    <h2>Start a Draft</h2>
                    <h3>Draft</h3>
                    <div className="row">
                        <div className="col-xs-12">
                            Name
                            <Input value={this.state.draft.name} onChange={this.updateDraftName} />
                        </div>
                    </div>
                    <hr/>
                    <h3>Teams</h3>
                    <div className="row">
                        <div className="col-xs-10">
                            Name
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-xs-12">
                            <Input value={this.state.teamName} onChange={this.updateTempTeamName} onEnter={this.addTeam}/>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-xs-12">
                            <table className="table">
                                <thead>
                                    <th className="col-xs-2">Order</th>
                                    <th className="col-xs-8">Name</th>
                                    <th className="col-xs-2">Is Owner</th>
                                    <th className="col-xs-2">Delete</th>
                                </thead>
                                <tbody>
                                    {teams}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <br/>
                    <div className="row">
                        <div className="col-xs-12">
                            <button className="btn btn-primary btn-lg pull-right" onClick={this.createDraft} disabled={!canCreate}>Start <i className="fa fa-check"></i></button>
                        </div>
                    </div>
                </div>
                <br/>
                <div className="create-body">
                    <h2>Continue a Draft</h2>
                    <div className="row">
                        <div className="col-xs-12">
                            {drafts}
                        </div>
                    </div>

                </div>
            </div>
        );
    }

});

module.exports = CreatePage;
