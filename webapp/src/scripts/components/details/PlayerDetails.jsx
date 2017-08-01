'use strict';

var React = require('react');

var PlayerStore = require('../../stores/PlayerStore');

var BlurTextArea = require('../form/BlurTextArea');

var PlayerDetails = React.createClass({
    displayName: 'PlayerDetails',

    getInitialState() {
        return {
            player: PlayerStore.getCurrent()
        };
    },

    componentDidMount() {
        PlayerStore.addChangeCurrentListener(this.onPlayerChange);
    },
    componentWillUnmount() {
        PlayerStore.removeChangeListener(this.onPlayerChange);
    },

    onPlayerChange() {
        this.setState({
            player: PlayerStore.getCurrent()
        });
    },

    updateNotes: function(notes) {
        this.state.player.get('core').save({
            notes: notes
        });
    },

    render() {
        var content = null;
        if(this.state.player.get('id')) {
            var core = this.state.player.get('core');
            content = <BlurTextArea value={core.get('notes')} onChange={this.updateNotes} rows={9}/>;
        }
        return (
            <div className="player-details">
                {content}
            </div>
        );
    }
});

module.exports = PlayerDetails;
