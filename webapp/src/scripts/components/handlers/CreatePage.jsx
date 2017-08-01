'use strict';

var React = require('react');

var DraftStore = require('../../stores/DraftStore');
var TeamStore = require('../../stores/TeamStore');

var Input = require('../form/Input');
var Checkbox = require('../form/Checkbox');

var Q = require('q');

var CreatePage = React.createClass({
    displayName: 'CreatePage',
    getInitialState() {
        return {
            draft: {name:''},
            teams: [],
            teamName: "",
            drafts: DraftStore.getAll()
        };
    },

    componentDidMount() {
        DraftStore.loadAll();

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
        window.location = '#/draft/' + id;
    },

    createDraft() {
        var self = this;
        DraftStore.create(this.state.draft, {}, {
            success: function(draft) {
                Q.all(self.state.teams.map(function(team, index){
                    team.order = index;
                    var def = Q.defer();
                    TeamStore.create(team, {draftId: draft.get('id')}, {
                        success:function(){
                            def.resolve();
                        }
                    });
                    return def.promise;
                })).then(function(){
                    self.gotoDraft(draft.get('id'));
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
            var moveDown = function() {
                self.state.teams.splice(index, 1);
                self.state.teams.splice(index+1, 0, team);
                self.setState({teams:self.state.teams});
            };
            var moveUp = function() {
                self.state.teams.splice(index, 1);
                self.state.teams.splice(index-1, 0, team);
                self.setState({teams:self.state.teams});
            };
            var downButton = null;
            if(index < self.state.teams.length-1) {
                downButton = (
                    <button className="btn btn-info btn-xs" style={{float:'left'}} onClick={moveDown}>
                        <i className="fa fa-arrow-down"></i>
                    </button>
                );
            }
            var upButton = null;
            if(index > 0) {
                upButton = (
                    <button className="btn btn-info btn-xs" style={{float:'right'}}  onClick={moveUp}>
                        <i className="fa fa-arrow-up"></i>
                    </button>
                );
            }

            return (
                <tr key={index}>
                    <td className="col-xs-2">{index}</td>
                    <td className="col-xs-2"><Checkbox checked={team.is_owner} onChange={setOwner}/></td>
                    <td className="col-xs-4">{team.name}</td>
                    <td className="col-xs-2"><button className="btn btn-danger btn-xs" onClick={deleteTeam}><i className="fa fa-close"></i></button></td>
                    <td className="col-xs-2">{downButton} {upButton}</td>
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
                                    <tr>
                                        <th className="col-xs-2">Order</th>
                                        <th className="col-xs-2">Owner</th>
                                        <th className="col-xs-4">Name</th>
                                        <th className="col-xs-2">Delete</th>
                                        <th className="col-xs-2">Reorder</th>
                                    </tr>
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
