/** @jsx React.DOM */

'use strict';

var React = require('react');

var DraftStore = require('../../stores/DraftStore');
var TeamStore = require('../../stores/TeamStore');
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
            }
        });
    },

    updateDraftName(name) {
        this.state.draft.name = name;
        this.setState({
            draft: this.state.draft
        });
    },

    updateDraftRounds(rounds) {
        this.state.draft.rounds = rounds;
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
            teams: this.state.teams
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
            return (
                <tr key={index}>
                    <td className="col-xs-2">{index}</td>
                    <td className="col-xs-8">{team.name}</td>
                    <td className="col-xs-2">{team.is_owner}</td>
                    <td className="col-xs-2"><button className="btn btn-danger btn-sm" onClick={deleteTeam}>Delete</button></td>
                </tr>
            );
        });

        return (
            <div className="fill-height">
                <div className="row">
                    <div className="col-xs-12">
                        {drafts}
                    </div>
                </div>
                <hr/>
                <div className="row">
                    <div className="col-xs-10">
                        Name
                        <Input value={this.state.draft.name} onChange={this.updateDraftName} />
                    </div>
                    <div className="col-xs-2">
                        Rounds
                        <Input value={this.state.draft.rounds} onChange={this.updateDraftRounds} />
                    </div>
                </div>
                <hr/>
                Team
                <div className="row">
                    <div className="col-xs-10">
                        <Input value={this.state.teamName} onChange={this.updateTempTeamName} />
                    </div>
                    <div className="col-xs-2">
                        <button className="btn btn-success" onClick={this.addTeam}>New Team</button>
                    </div>
                </div>

                <div className="row">
                    <div className="col-xs-12">
                        <table>
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
                <hr/>
                <button className="btn btn-success btn-lg" onClick={this.createDraft}>Start</button>
            </div>
        );
    }

});

module.exports = CreatePage;
