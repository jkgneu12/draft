var EventEmitter = require('events').EventEmitter;

var assign = require('object-assign');

var DraftStore = require('./DraftStore');
var PlayerStore = require('./PlayerStore');
var TeamStore = require('./TeamStore');
var RosterStore = require('./RosterStore');

var _draggedItem = null;
var _draggedType = null;


var DragDropStore = assign({}, EventEmitter.prototype, {

    getDraggedItem: function() {
        return _draggedItem;
    },
    getDraggedType: function() {
        return _draggedType;
    },
    dragged: function(item, type) {
        _draggedItem = item;
        _draggedType = type;
    },
    dropped: function(item, type) {
        if(type === "teamListItem") {
            var team = item.team;
            var player = this.getDraggedItem().player;

            var currentTeamId = player.get('team_id');

            player.save({team_id: team.get('id'), paid_price: PlayerStore.getValue()}, {
                success: function() {
                    team.fetch({
                        success: function() {
                            RosterStore.refreshCurrent();

                            if(currentTeamId <= 0) {
                                var draft = DraftStore.getCurrent();

                                var currentTeam = TeamStore.getAll().findWhere({is_turn: true});
                                var nextOrder = currentTeam.get('order') + 1;
                                if(nextOrder == TeamStore.getAll().length) {
                                    nextOrder = 0;
                                    draft.save({round: draft.get('round') + 1})
                                }
                                var nextTeam = TeamStore.getAll().findWhere({order: nextOrder});

                                currentTeam.save({is_turn: false});
                                nextTeam.save({is_turn: true});
                            } else {
                                TeamStore.getAll().findWhere({id: currentTeamId}).fetch();
                            }
                        }
                    });
                }
            });
        }
    }
});

module.exports = DragDropStore;